/**
 * Copyright (c) 2018, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const mm = require('micromatch');
const me = /([/]([^/]+)[/])me([/])/g;
const route = '$1:$2Id$3';

const implentation = {
  async remove(id, params) {
    return await this.respond({ id, params });
  },
  async get(id, params) {
    return await this.respond({ id, params });
  },
  async find(params) {
    return await this.respond({ params });
  },
  async patch(id, data, params) {
    return await this.respond({ id, data, params });
  },
  async create(data, params) {
    return await this.respond({ data, params });
  },
  async update(id, data, params) {
    return await this.respond({ id, data, params });
  },
};

const defaultDeifiedconfig = {
  glob: {
    globs: ['**/@(delete|get|patch|post|put).js'],
  },
};

const defaultBindingConfig = {
  DELETE: { service: 'remove', globs: ['**/delete.js'] },
  GET: [
    { service: 'get', globs: ['**/me/get.js'] },
    { service: 'find', globs: ['**/!(me)/get.js'] },
  ],
  PATCH: { service: 'patch', globs: ['**/patch.js'] },
  POST: { service: 'create', globs: ['**/post.js'] },
  PUT: { service: 'update', globs: ['**/put.js'] },
};

const toPath = function(file, base) {
  //two regex passes are required because regexes do not match replaced content
  return file.replace(base, '').replace(me, route).replace(me, route);
};

module.exports = {
  process: function(files, importer, config) {
    const conf = Object.assign({}, defaultBindingConfig, config);
    const services = [];

    Object.entries(conf).forEach(([method, bindings]) => {
      if (!defaultBindingConfig[method]) return;

      (Array.isArray(bindings) ? bindings : [bindings]).forEach(binding => {
        mm(files, binding.globs).forEach(file => {
          const solos = importer(file);
          const service = implentation[binding.service].bind(solos);
          const path = toPath(file, files.base || process.cwd());
          services.push({ path, service, solos });
        });
      });
    });

    return services;
  },

  deify: async function(deified, directory, config) {
    const conf = Object.assign({}, defaultDeifiedconfig, config);
    const deify = deified.configure(conf);
    return await deify({ directory });
  },
};
