/**
 * Copyright (c) 2018, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const me = /([/]([^/]+)[/])me([/])/g;
const end = /[/]solos[.]js$/;
const param = '$1:$2Id$3';
const d = require('debug');
const ns = 'solos:';
const log = {
  debug: {
    process: d(`${ns}process`),
    deify: d(`${ns}deify`),
    toPath: d(`${ns}deify`),
  },
  trace: {
    process: d(`${ns}process:trace`),
    deify: d(`${ns}deify:trace`),
    toPath: d(`${ns}deify:trace`),
  },
};

const defaultDeifiedConfig = {
  glob: {
    globs: ['**/solos.js'],
  },
};

const calls = ['remove', 'get', 'find', 'patch', 'create', 'update'];

function getLog(call) {
  if (log[call]) {
    return log[call];
  }

  return log[call] = {
    debug: d(`${ns}${call}`),
    trace: d(`${ns}${call}:trace`),
  };
}

//const defaultProcessConfig = {}; //not needed yet

const toPath = function(file, base) {
  //two regex passes are required because regexes do not match replaced content
  log.trace.toPath({ args: { file, base } }, 'enter');
  return file.replace(base, '').replace(me, param).replace(me, param).replace(end, '');
};

module.exports = {
  process(files, config, toModule = require, toURI = toPath) {
    log.trace.process({ args: { files, config, toModule, toURI } }, 'enter');
    //const conf = Object.assign({}, defaultProcessConfig, config); //not needed yet
    const services = [];

    files.forEach(file => {
      const solos = toModule(file);
      const path = toURI(file, files.base || process.cwd());
      const endpoint = { path, solos };

      calls.forEach(call => {
        const impl = solos[call];
        if (impl && typeof impl === 'function') {
          solos[call] = async function() {
            const args = Array.apply(null, arguments);
            args.push(getLog(call));

            return impl.apply(impl.this, args);
          };
        }
      });

      log.debug.process(endpoint);
      services.push(endpoint);
    });

    return services;
  },

  async deify(deified, directory, config) {
    log.trace.deify({ args: { deified, directory, config } }, 'enter');
    const conf = Object.assign({}, defaultDeifiedConfig, config);
    const deify = deified.configure(conf);
    return await deify({ directory });
  },
};
