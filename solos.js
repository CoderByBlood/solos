/**
 * Copyright (c) 2015, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

/**
 * @module solos
 */

const deified = require('deified');
const services = require('./services');
const d = require('debug');
const ns = 'solos:';
const logs = {};
const log = {
  debug: {
    init: d(`${ns}init`),
    beforeall: d(`${ns}beforeall`),
    afterall: d(`${ns}afterall`),
  },
  trace: {
    init: d(`${ns}init:trace`),
    beforeall: d(`${ns}beforeall:trace`),
    afterall: d(`${ns}afterall:trace`),
  },
};

/**
 * The default configuration for the process function
 * 1. `directory: process.cwd()` - the full path to the directory to scan
 *    for solos files, defaults to current working directory
 * 2. `deified: {...}` - the configuration passed to deified module - see
 *    their docs:
 *    1. `glob: {globs: ['**`&#8205;`/*.solos.js'], }` the default is all solos.js
 *       files in subdirectories
 * 3. `hooks:{...}` has two properties `before` and `after`
 *    1. `before: ['receive', 'validate', 'authorize', 'before', ]` the
 *       callback **before** hooks, in the order called
 *    2. `after: ['after', ]` the callback **after** hook, in the
 *       order called
 */
const defaultConfig = {
  directory: process.cwd(),
  deified: {},
  services: {},
  hooks: {
    before: ['receive', 'validate', 'authorize', 'before', ],
    after: ['after', ],
  },
};

const calls = ['remove', 'get', 'find', 'patch', 'create', 'update'];
const beforecalls = [];
const aftercalls = [];

/**
 * Configures debug module for all of the hook combinations:
 * - receive
 * - receive_[remove|get|find|patch|create|update]
 * - validate
 * - validate_[remove|get|find|patch|create|update]
 * - authorize
 * - authorize_[remove|get|find|patch|create|update]
 * - before
 * - before_[remove|get|find|patch|create|update]
 * - after
 * - after_[remove|get|find|patch|create|update]
 *
 * The namespace is:
 * - 'solos:hook:{hook}' - for debugging
 * - 'solos:hook:{hook}:trace' - for tracing function calls
 *
 * @param {object} conf **required** Configuration holding the hook names -
 * see `init()` docs for more details
 */
function setupLogs(conf) {
  beforecalls.length = 0;
  aftercalls.length = 0;

  conf.hooks.before.forEach(hook => {
    beforecalls.push(hook);
    logs[hook] = {
      debug: d(`${ns}hook:${hook}`),
      trace: d(`${ns}hook:${hook}:trace`)
    };

    calls.forEach(call => {
      const beforecall = `${hook}_${call}`;
      beforecalls.push(beforecall);
      logs[beforecall] = {
        debug: d(`${ns}hook:${beforecall}`),
        trace: d(`${ns}hook:${beforecall}:trace`)
      };
    });
  });

  conf.hooks.after.forEach(hook => {
    aftercalls.push(hook);
    logs[hook] = {
      debug: d(`${ns}hook:${hook}`),
      trace: d(`${ns}hook:${hook}:trace`)
    };

    calls.forEach(call => {
      const aftercall = `${hook}_${call}`;
      aftercalls.push(aftercall);
      logs[aftercall] = {
        debug: d(`${ns}hook:${aftercall}`),
        trace: d(`${ns}hook:${aftercall}:trace`)
      };
    });
  });
}

module.exports = {
  /**
   * Finds all solos.js files in subdirectories and registers them as featherjs
   * services with before and after callback hooks.
   *
   * #### The required configuration is: ####
   * 1. NONE
   *
   * #### The optional configuration is: ####
   * 1. See the docs for `defaultConfig` on this page for details
   *
   * @param {object} app **required** Featherjs app - services are registered here
   * @param {object} config **optional** The configuration
   * @param {function} toModule **optional** `function(path)` that returns
   * a service - defaults to `require`
   * @param {function} toURI **optional** `function(filepath, basepath)`
   * that returns a URI endpoint for the service
   */
  async init(app, config, toModule, toURI) {
    log.trace.init({ enter: 'init', args: { app, config, toModule, toURI } });

    const conf = Object.assign({}, defaultConfig, config);
    log.debug.init({ conf });

    const files = await services.deify(deified, conf.directory, conf.deified);
    files.base = conf.directory;
    log.debug.init({ files });

    const endpoints = services.process(files, conf.services, toModule, toURI);
    log.debug.init({ endpoints });

    setupLogs(conf);
    log.debug.init({ beforecalls });
    log.debug.init({ aftercalls });

    endpoints.forEach(endpoint => {
      const end = /[_]([^_]+$)/;

      app.use(endpoint.path, endpoint.solos);
      app.service(endpoint.path).hooks({
        before: {
          all: beforecalls.map(hook => {
            return async context => {
              log.trace.beforeall({ enter: hook, args: { hook, context } });
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                context.log = logs[hook];
                const method = hook.match(end);

                if (!method || method[1] === context.method) {
                  log.debug.beforeall({ calling: hook });
                  return callback(context);
                }
              }

              return context;
            };
          }),
        },
        after: {
          all: aftercalls.map(hook => {
            return async context => {
              log.trace.afterall({ enter: hook, args: { hook, context } });
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                context.log = logs[hook];
                const method = hook.match(end);

                if (!method || method[1] === context.method) {
                  log.debug.afterall({ calling: hook });
                  return callback(context);
                }
              }

              return context;
            };
          }),
        },
      });
    });
  }
};
