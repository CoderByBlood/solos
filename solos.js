/**
 * Copyright (c) 2015, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const deified = require('deified');
const defaultConfig = {
  methods: {
    directory: '.',
    scan: {
      filter: {},
      glob: {
        globs: ['**/delete.js', '**/get.js', '**/head.js', '**/post.js', '**/put.js'],
      }
    },
  },
  entities: {
    directory: '.',
    scan: {
      filter: {},
      glob: {
        globs: ['**/*.entity.js'],
      }
    },
  }
};

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
exports.init = function init(app, config) {
  const conf = Object.assign({}, defaultConfig, config);
  //scan for solos methods
  const deify = deified.configure(conf.methods);
  const methods = deify({ directory: conf.methods.directory || process.cwd() })
  //creates services for the methods
  //create hooks for entity loading
  //create hooks for method lifecycle
};
