/**
 * Copyright (c) 2015, Three Pawns, Inc. All rights reserved.
 */

'use strict';

const HTTP = require('http');
const UUID = require('uuid');
const Authorization = require('express-authorization');


/**
 * @constructor
 *
 * @author Phillip Smith
 */
function MethodBinder(application) {
  this.app = application || {};
  this.seneca = undefined;
  this.logger = undefined;
}


/**
 * Node's HTTP method names in lowercase
 *
 * @type {Array}
 */
MethodBinder.NAMES = HTTP.METHODS.map(name => name.toLowerCase());

/**
 * Key into request for the currently (or soon to be) executing process
 *
 * @type {string}
 */
MethodBinder.EXECUTING = 'solos_method';

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated <strong>BUT NOT authorized</strong> as this point
 * in the lifecycle!
 *
 * @type {string}
 */
MethodBinder.REQUEST_RECEIVED = 'request_received';

/**
 * Lifecycle function name for validating the user input
 *
 * @type {string}
 */
MethodBinder.VALIDATE_REQUEST = 'validate';

/**
 * Lifecycle function name for securing access to endpoint
 *
 * @type {string}
 */
MethodBinder.AUTHORIZE_REQUEST = 'authorize';

/**
 * Property name of the permission string
 *
 * @type {string}
 */
MethodBinder.PERMISSION = 'permission';

/**
 * Lifecycle function name for pre-processing the request
 *
 * @type {string}
 */
MethodBinder.BEFORE_RESPONSE = 'before';

/**
 * Lifecycle function name for processing the request
 *
 * @type {string}
 */
MethodBinder.RESPOND = 'respond';

/**
 * Lifecycle function name for post-processing and cleanup
 *
 * @type {string}
 */
MethodBinder.AFTER_RESPONSE = 'after';

/**
 * The Lifecycle function names in the order they are executed
 *
 * @type {String[]}
 */
MethodBinder.LIFECYCLE = [
  MethodBinder.REQUEST_RECEIVED,
  MethodBinder.VALIDATE_REQUEST,
  MethodBinder.AUTHORIZE_REQUEST,
  MethodBinder.BEFORE_RESPONSE,
  MethodBinder.RESPOND,
  MethodBinder.AFTER_RESPONSE,
];

function authorize(msg, done) {
  const user = msg.req.user || {};
  const roles = user.roles || [];
  const owner = user.id;
  const replaceRegex = /[:]owner$/;
  const method = msg.req[MethodBinder.EXECUTING];
  let claimPermitted = false;

  for (let i = 0; i < roles.length && !claimPermitted; i += 1) {
    const claim = Authorization.considerPermissions(roles[i]);
    claimPermitted = claim.isPermitted((method[MethodBinder.PERMISSION] || '').replace(replaceRegex, owner));
  }

  if (!method.isAuthorized(claimPermitted)) {
    msg.res.sendStatus(403);
    msg.logger.debug('Authorization Failed, sending 403', msg);
    done(new Error('403'), msg);
  } else {
    done(undefined, msg);
  }
}


/**
 * Returns a closure around its parameters that executes the lifecycle functions in this order:
 *
 * <ol>
 *     <li>{@link MethodBinder.REQUEST_RECEIVED}: request has been authenticated but not
 *          authorized</li>
 *     <li>{@link MethodBinder.AUTHORIZE_REQUEST}: authorizes request</li>
 *     <li>{@link MethodBinder.VALIDATE_REQUEST}: validate user input</li>
 *     <li>{@link MethodBinder.BEFORE_RESPONSE}: pre-processing</li>
 *     <li>{@link MethodBinder.RESPOND}: perform work</li>
 *     <li>{@link MethodBinder.AFTER_RESPONSE}: post-processing and cleanup</li>
 * </ol>
 *
 *
 * @param method Object that represents the method to execute (get, post, delete, ect)
 * @return {Function} A closure that is bindable into express[methodName](uri, ...) with
 * the signature (req, res, next)
 */
MethodBinder.prototype.executeMethod = function executeMethod(method) {
  const THIS = this;
  const chains = []; // cached chains of responsibility

  return function execute(req, res, next) {
    THIS.logger.debug('Executing Method', method);
    const methodName = method.methodName;
    const uri = method.uri === '' ? '/' : method.uri;

    req[MethodBinder.EXECUTING] = method;
    req.uuid = UUID.v4();

    let responded = false;

    // Lookup existing chain
    chains[uri] = chains[uri] || [];
    let chain = chains[uri][methodName];

    // Always the last link in the chain
    function lastLink(err, msg) {
      if (err) {
        next(err);
      } else if (!msg.res.headersSent) {
        msg.res.sendStatus(405);
        msg.logger.error('Method Completed without Response sending 405', msg);
        next(new Error('405'));
      } else {
        // give control back to express
        next();
      }
    }

    if (chain) {
      THIS.logger.debug('Using cached chain', chain);
    } else {
      // Create Chain of Responsibility
      // Rule 1: Each link MUST honor the lifecycle function taking msg and callback parameters
      // Rule 2: Each link MUST short circuit if headers have already been sent
      // Rule 3: The exception to Rule 2
      //    the AFTER lifecycle should always be called if an only if RESPOND was called
      // Rule 4: Each link MUST short circuit upon error (first argument to callback)
      chain = MethodBinder.LIFECYCLE.map((lifecycle, index) => {
        let link = {};
        const pattern = {
          role: 'solos',
          cmd: methodName,
          path: uri,
          cycle: lifecycle,
        };

        THIS.logger.debug('Method Info', {
          name: lifecycle,
          method: method[lifecycle],
        });

        THIS.seneca.add(pattern, (args, callback) => {
          THIS.logger.info('Executing Pattern', pattern);
          if (typeof method[lifecycle] === typeof Function && method[lifecycle].length > 1) {
            method[lifecycle](args, callback);
          } else {
            THIS.logger.info('EXECUTING - Missing Lifecycle', {
              method: methodName,
              uri,
              cycle: lifecycle,
            });
            callback(undefined, args);
          }
        });

        link = function (err, msg) {
          if (err) {
            chain[index + 1](err, msg);
          } else {
            if (!msg.res.headersSent && lifecycle === MethodBinder.RESPOND) {
              responded = true;
            }

            if (!msg.res.headersSent || (responded && lifecycle === MethodBinder.AFTER_RESPONSE)) {
              THIS.seneca.act(pattern, msg, (error, result) => {
                chain[index + 1](error, result);
              });
            } else {
              chain[index + 1](undefined, msg);
            }
          }
        };

        return link;
      });

      chain.push(lastLink);
      chains[uri][methodName] = chain; // Cache the chain
    }

    // GO!
    chain[0](undefined, {
      req,
      res,
      seneca: THIS.senaca,
      logger: THIS.logger,
      express: THIS.app,
    });
  };
};

/**
 * Loads the method specified by the event and binds it into the Express framework
 *
 * @param msg The details of a new Method
 */
MethodBinder.prototype.bind = function bind(msg) {
  this.logger.info('MethodBinder bind', msg);

  const THIS = this;
  const method = msg.method;
  const uri = msg.uri;
  const permission = msg.permission;
  const httpMethod = msg.httpMethod;

  const config = THIS.app.config;

  if (!method[MethodBinder.PERMISSION]) {
    method[MethodBinder.PERMISSION] = permission;
    THIS.logger.debug('Added', {
      permission,
      at: uri,
    });
  }

  if (!method[MethodBinder.AUTHORIZE_REQUEST]) {
    method[MethodBinder.AUTHORIZE_REQUEST] = authorize;
  }

  if (config && config.security && config.security.allowIsTheDefault) {
    method.isAuthorized = claimPermitted => !claimPermitted;
  } else {
    method.isAuthorized = claimPermitted => claimPermitted;
  }

  THIS.logger.info('Accessible URI:', {
    method: httpMethod.toUpperCase(),
    uri,
  });

  method.methodName = httpMethod;
  method.uri = uri;

  MethodBinder.LIFECYCLE.forEach((lifecycle) => {
    if (typeof method[lifecycle] !== typeof Function) {
      THIS.logger.warn('LOADING - Missing Lifecycle', {
        method: httpMethod,
        uri,
        cycle: lifecycle,
      });
    }
  });

  this.app[httpMethod](uri, this.executeMethod(method));
};


module.exports = function bind(options) {
  const seneca = this;
  const binder = new MethodBinder(options.app);
  binder.seneca = seneca;
  binder.logger = seneca.log;

  this.add({
    role: 'solos',
    cmd: 'bind',
    target: 'method',
  }, (msg, respond) => {
    binder.bind({
      httpMethod: msg.method,
      uri: msg.uri,
      method: msg.module,
      permission: msg.permission,
    });
    respond(undefined, {
      binder,
    });
  });
};

module.exports.MethodBinder = MethodBinder;
