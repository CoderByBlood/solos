/**
 * Copyright (c) 2018, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

/**
 * @module services
 */

const me = /([/]([^/]+)[/])me([/])/g;
const end = /[.]solos[.]js$/;
const param = '$1:$2Id$3';
const d = require('debug');
const ns = 'solos:';
const log = {
  debug: {
    process: d(`${ns}process`),
    deify: d(`${ns}deify`),
  },
  trace: {
    process: d(`${ns}process:trace`),
    deify: d(`${ns}deify:trace`),
  },
};

/**
 * The configuration passed to deified module - see their docs:
 * - `glob: {globs: ['**`&#8205;`/*.solos.js'], }` the default is all solos.js files
 *   in subdirectories
 */
const defaultDeifiedConfig = {
  glob: {
    globs: ['**/*.solos.js'],
  },
};

const calls = ['remove', 'get', 'find', 'patch', 'create', 'update'];

/**
 * Returns the debug log for the service call
 *
 * @param {string} call **required** [remove|get|find|patch|create|update]
 * @return {object} the debug loggers:
 * - `debug:` with namespace 'solos:{service}' - for debugging
 * - `trace:` with namespace 'solos:{service}:trace' - for tracing function calls
 */
function getLog(call) {
  return log[call] ? log[call] : log[call] = {
    debug: d(`${ns}${call}`),
    trace: d(`${ns}${call}:trace`),
  };
}

//const defaultProcessConfig = {}; //not needed yet

/**
 * Translates the full path to a file into a relative path with route parameters
 * by stripping off the base and replacing 'me' directors with parameters.
 *
 * /path/to/strip/path/to/me/file/endpoint.solos.js <-- file
 * /path/to/strip <-- base
 * /path/to/:toId/file/endpoint <-- return
 *
 * @param {string} file **required** The full path to the file
 * @param {string} base **required** The full path of the base to strip from the file
 *
 * @return {string} relative path with route parameters
 */
function toPath(file, base) {
  //two regex passes are required because regexes do not match replaced content
  log.trace.process({ enter: 'toPath', args: { file, base } });
  return file.replace(base, '').replace(me, param).replace(me, param).replace(end, '');
}

module.exports = {
  /**
   * Process the files in subdirectories and registers them as featherjs
   * services with before and after callback hooks.
   *
   * #### The required configuration is: ####
   * 1. NONE
   *
   * #### The optional configuration is: ####
   * 1. NONE
   *
   * @param {array} files **required** Full paths to files holding solos services
   * @param {object} config **optional** The configuration
   * @param {function} toModule **optional** `function(path)` that returns a
   * service - defaults to `require`
   * @param {function} toURI **optional** `function(filepath, basepath)` that
   * returns a URI endpoint for the service - defaults to `toPath`
   */
  process(files, config, toModule = require, toURI = toPath) {
    log.trace.process({ enter: 'process', args: { files, config, toModule, toURI } });
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

  /**
   * Finds all solos.js files in subdirectories
   *
   * #### The required configuration is: ####
   * 1. NONE
   *
   * #### The optional configuration is: ####
   * 1. `glob: {globs: ['**`&#8205;`/*.solos.js'], }` the default is all solos.js
   * files in subdirectories
   *
   * @param {object} deified **required** The deified module
   * @param {object} directory **required** The root directory to scan for files
   * @param {object} config **optional** The configuration passed to
   * deified module - see their docs:
   */
  async deify(deified, directory, config) {
    log.trace.deify({ enter: 'deify', args: { deified, directory, config } });

    const conf = Object.assign({}, defaultDeifiedConfig, config);
    log.debug.deify({ conf });

    const deify = deified.configure(conf);
    return await deify({ directory });
  },
};
