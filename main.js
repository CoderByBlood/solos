/**
 * Copyright (c) 2015, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const deified = require('deified');
const methods = require('./methods');
const d = require('debug');
const ns = 'solos:';
const logs = {};
const log = {
  debug: {
    init: d(`${ns}init`),
  },
  trace: {
    init: d(`${ns}init:trace`),
  },
};

const defaultConfig = {
  directory: process.cwd(),
  deified: {},
  methods: {},
  hooks: {
    before: ['receive', 'validate', 'authorize', 'before', ],
    after: ['after', ],
  },
};

const calls = ['remove', 'get', 'find', 'patch', 'create', 'update'];

module.exports = {
  /**
   * @module solos
   * @description Pass this method in to the Express app use binding with the solos
   * configuration data.
   *
   * ##### The required configuration for solos is: #####
   * 1. ddd
   *
   * ##### The optional configuration for solos is: #####
   * 1. ddd
   *
   * @param router Express's Router to bind solos
   * @param seneca Seneca instance to use for message passing
   * @param config JSON configuration for solos
   */
  async init(app, config, toModule, toURI) {
    log.trace.init({ args: { app, config, toModule, toURI } }, 'enter');
    const conf = Object.assign({}, defaultConfig, config);
    const files = await methods.deify(deified, conf.directory, conf.deified);
    const endpoints = methods.process(files, conf.methods, toModule, toURI);
    const beforecalls = [];
    const aftercalls = [];

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

    endpoints.forEach(endpoint => {
      const end = /[_]([^_]+$)/;

      app.use(endpoint.path, endpoint.solos);
      app.service(endpoint.path).hooks({
        before: {
          all: beforecalls.map(hook => {
            return async context => {
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                context.log = logs[hook];
                const method = hook.match(end);
                if (!method || method[1] === context.method) {
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
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                context.log = logs[hook];
                const method = hook.match(end);

                if (!method || method[1] === context.method) {
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
