/**
 * Copyright (c) 2018, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const mm = require('micromatch');
const me = /([/]([^/]+)[/])me([/])/g;
const route = '$1:$2Id$3';
const d = require('debug');
const ns = 'solos:methods:';
const log = {
  debug: {
    process: d(ns + 'process'),
    deify: d(ns + 'deify'),
    toPath: d(ns + 'deify'),
  },
  trace: {
    process: d(ns + 'process:trace'),
    deify: d(ns + 'deify:trace'),
    toPath: d(ns + 'deify:trace'),
  },
  respond: {
    debug: d('solos:respond'),
    trace: d('solos:respond:trace'),
  },
};

const impl = {
  async remove(id, params) {
    return await this.respond({ id, params, log: log.respond });
  },
  async get(id, params) {
    return await this.respond({ id, params, log: log.respond });
  },
  async find(params) {
    return await this.respond({ params, log: log.respond });
  },
  async patch(id, data, params) {
    return await this.respond({ id, data, params, log: log.respond });
  },
  async create(data, params) {
    return await this.respond({ data, params, log: log.respond });
  },
  async update(id, data, params) {
    return await this.respond({ id, data, params, log: log.respond });
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
  log.trace.toPath({ args: { file, base } }, 'enter');
  return file.replace(base, '').replace(me, route).replace(me, route);
};

module.exports = {
  process(files, config, toModule, toURI) {
    log.trace.process({ args: { files, config, toModule, toURI } }, 'enter');
    const conf = Object.assign({}, defaultBindingConfig, config);
    const importer = toModule || require;
    const uri = toURI || toPath;
    const services = [];

    Object.entries(conf).forEach(([method, bindings]) => {
      if (!defaultBindingConfig[method]) return;

      (Array.isArray(bindings) ? bindings : [bindings]).forEach(binding => {
        mm(files, binding.globs).forEach(file => {
          const solos = importer(file);
          const path = uri(file, files.base || process.cwd());
          const service = {};

          service[binding.service] = impl[binding.service].bind(solos);
          const endpoint = { path, service, solos };
          log.debug.process(endpoint);
          services.push(endpoint);
        });
      });
    });

    return services;
  },

  async deify(deified, directory, config) {
    log.trace.deify({ args: { deified, directory, config } }, 'enter');
    const conf = Object.assign({}, defaultDeifiedconfig, config);
    const deify = deified.configure(conf);
    return await deify({ directory });
  },
};
