/**
 * Copyright (c) 2015, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const deified = require('deified');
const methods = require('./methods');

const defaultConfig = {
  directory: process.cwd(),
  deified: {},
  methods: {},
  hooks: {
    before: ['receive', 'validate', 'authorize', 'before', ],
    after: ['after', ],
  },
};

module.exports = {
  /**
   * @module solos
   * @description Pass this method in to the Express app use binding with the solos
   * configuration data.
   *
   *  <dl>
   *      <dt>The required configuration items for solos are:</dt>
   *      <dd>
   *          <li></li>
   *      </dd>
   *
   *      <dt>The optional configuration items for solos are:</dt>
   *      <dd>
   *          <li></li>
   *      </dd>
   *  </dl>
   *
   * @param router Express's Router to bind solos
   * @param seneca Seneca instance to use for message passing
   * @param config JSON configuration for solos
   */
  async init(app, config) {
    const conf = Object.assign({}, defaultConfig, config);
    const files = await methods.deify(deified, conf.directory, conf.deified);
    const endpoints = methods.process(files, conf.methods);

    endpoints.forEach(endpoint => {
      app.use(endpoint.path, endpoint.service);
      app.service(endpoint.path).hooks({
        before: {
          all: conf.hooks.before.map(hook => {
            return async context => {
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                return await callback(context);
              }

              return context;
            };
          }),
        },
        after: {
          all: conf.hooks.after.map(hook => {
            return async context => {
              const callback = endpoint.solos[hook];
              if (callback && typeof callback === 'function') {
                return await callback(context);
              }

              return context;
            };
          }),
        },
      });
    });
  }
};
