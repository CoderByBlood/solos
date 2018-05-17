/* eslint-disable no-trailing-spaces, no-irregular-whitespace */
/**
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 *
 * The Lifecycle functions are called in the order they are defined in this file.
 * All functions are optional except 'respond(context)'.
 * If defined, the first parameter 'context' has req, res properties which give you access to the
 * http request and http response -and- es6 Promises must always be returned
 *
 * Example Directory Structure
 * .
 * ├── solos  <-- configurable root directory - see config
 * │   ├── get.js  <-- GET http://domain.com/
 * │   ├── alpha
 * │   │   ├── get.js  <-- GET http://domain.com/alpha/
 * │   │   └── me  <-- 'me' is a special directory name that signals express entity loading
 * │   │       ├── beta
 * │   │       │   └── me
 * │   │       │       └── gama
 * │   │       │           └── put.js  <-- PUT http://domain.com/alpha/:alpha/beta/:beta/gama/
 * │   │       ├── post.js  <-- POST http://domain.com/alpha/:alpha/
 * │   │       └── sample
 * │   │           └── get.js  <-- GET http://domain.com/alpha/:alpha/sample/
 * │   ├── beta
 * │   │   └── me
 * │   │       └── sample
 * │   │           └── delete.js  <-- DELETE http://domain.com/beta/:beta/sample/
 * │   └── entities
 * │       ├── alpha-entity.js  <-- binding into req.solos_context.entities.alpha for /:alpha/
 * │       └── beta-entity.js  <-- binding into req.solos_context.entities.beta for /:beta/
 */
/* eslint-enable */

'use strict';

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated <strong>BUT NOT authorized</strong> as this point
 * in the lifecycle!
 */
exports.receive = async function receive(context) {
  context.log.debug('Callback successful', {
    method: 'receive',
  });
  return context;
};

/**
 * Lifecycle function name for validating the user input.
 */
exports.validate = async function validate(context) {
  context.log.debug('Callback successful', {
    method: 'validate',
  });
  return context;
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 * Define this only if you want to override the default behavior, which uses regular expressions
 * to authorize the call.
 */
exports.authorize = async function authorize(context) {
  context.log.debug('Callback successful', {
    method: 'authorize',
  });
  return context;
};

/**
 * Lifecycle function name for pre-processing the request.
 */
exports.before = async function before(context) {
  context.log.debug('Callback successful', {
    method: 'before',
  });
  return context;
};

/**
 * Lifecycle function name for processing the request.
 * This call must send a response to the client.  A response can be sent using any means that
 * express supports including template engines.  If a response is not sent, solos sends a 405 to
 * the client.
 */
exports.respond = async function respond(context) {
  context.log.debug('Callback successful', {
    method: 'respond',
  });
  return {message: 'Solos Lives!!!'};
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if 'respond' was called.
 */
exports.after = async function after(context) {
  context.log.debug('Callback successful', {
    method: 'after',
  });
  return context;
};
