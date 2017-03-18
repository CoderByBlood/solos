/**
 * Copyright (c) 2015, Three Pawns, Inc. All rights reserved.
 */

'use strict';

const HTTP = require('http');
const UUID = require('uuid');


/**
 * @constructor
 *
 * @author Phillip Smith
 */
function MethodBinder(application) {
  this.app = application || {};
  this.seneca = undefined;
  this.logger = undefined;
  this.config = this.app.config || {};

  const security = this.config.security || {};
  const groups = JSON.parse(JSON.stringify(security.groups || {}));
  Object.keys(groups).forEach((key) => {
    groups[key] = Array.isArray(groups[key]) ? groups[key] : [groups[key]];
    groups[key] = groups[key].map(regex => new RegExp(regex));
  });

  this.groups = groups;
  this.allowAll = security.allowAll || false;
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
 * Lifecycle function name for authorizing the user to endpoint.
 * Define this only if you want to override the default behavior, which uses express-authorize
 * to authorize the call.
 *
 * @type {string}
 */
MethodBinder.AUTHORIZE_REQUEST = 'authorize';

/**
 * Lifecycle function name for pre-processing the request.
 *
 * @type {string}
 */
MethodBinder.BEFORE_RESPONSE = 'before';

/**
 * Lifecycle function name for processing the request.
 * This call must send a response to the client.  A response can be sent using any means that
 * express supports including template engines.  If a response is not sent, solos sends a 405 to
 * the client.
 *
 * @type {string}
 */
MethodBinder.RESPOND = 'respond';

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if 'respond' was called.
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
        msg.logger.error('Method Completed without Response, sending 405', msg);
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

        THIS.logger.debug('Method Info', {
          name: lifecycle,
          method: method[lifecycle],
        });

        link = function (err, msg) {
          if (err) {
            chain[index + 1](err, msg);
          } else {
            if (!msg.res.headersSent && lifecycle === MethodBinder.RESPOND) {
              responded = true;
            }

            if (!msg.res.headersSent || (responded && lifecycle === MethodBinder.AFTER_RESPONSE)) {
              if (typeof method[lifecycle] === typeof Function && method[lifecycle].length > 0) {
                method[lifecycle](msg).then((result) => {
                  chain[index + 1](undefined, result);
                }).catch((error) => {
                  chain[index + 1](error, undefined);
                });
              } else {
                THIS.logger.info('EXECUTING - Missing Lifecycle', {
                  method: methodName,
                  uri,
                  cycle: lifecycle,
                });

                chain[index + 1](err, msg);
              }
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
  const httpMethod = msg.httpMethod;

  if (!method[MethodBinder.AUTHORIZE_REQUEST]) {
    method[MethodBinder.AUTHORIZE_REQUEST] = function authorize(message, done) {
      const req = message.req;
      const user = req.user || {};
      const roles = user.groups || [];
      let claimPermitted = false;

      message.logger.debug('Authorizing User', user);

      for (let i = 0; i < roles.length && !claimPermitted; i += 1) {
        const regexes = THIS.groups[roles[i]] || [];
        message.logger.debug('Regular Expressions', regexes);

        for (let j = 0; j < regexes.length && !claimPermitted; j += 1) {
          const regex = regexes[j];
          message.logger.debug('Regular Expression Found', regex);

          if (regex) {
            const claim = `${req.method} ${req.path}`;
            claimPermitted = claim.match(regex);
            message.logger.debug('Authorization Found', claimPermitted);
          }
        }
      }

      if (!method.isAuthorized(claimPermitted)) {
        message.res.sendStatus(403);
        message.logger.debug('Authorization Failed, sending 403', message);
        done(new Error('403'), message);
      } else {
        done(undefined, message);
      }
    };
  }

  if (THIS.allowAll) {
    method.isAuthorized = () => true;
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
