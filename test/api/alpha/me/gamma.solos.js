/* eslint-disable no-trailing-spaces, no-irregular-whitespace */
/**
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 *
 * Functions are called in the following order:
 * 1. receive(context)
 * 2. receive_[remove|get|find|patch|create|update](context)
 * 3. validate(context)
 * 4. validate_[remove|get|find|patch|create|update](context)
 * 5. authorize(context)
 * 6. authorize_[remove|get|find|patch|create|update](context)
 * 7. before(context)
 * 8. before_[remove|get|find|patch|create|update](context)
 * 9. [remove|get|find|patch|create|update](...)
 * 10. after(context)
 * 11. after_[remove|get|find|patch|create|update](context)
 *
 * If the parameter is 'context', then it has properties documented by feathersjs:
 * see [Hook documentation](https://docs.feathersjs.com/api/hooks.html).  The
 * context parameter has an addtional `log` property.  `log.debug()` for general
 * debugging and `log.trace()` for detailed tracing - both are from the debug
 * module.
 *
 * The module must export at least one service method as defined by feathersjs:
 * see [Service documentation](https://docs.feathersjs.com/api/services.html).
 *
 * The mapping between HTTP Methods and services methods are defined by featherjs:
 * see [REST documentation](https://docs.feathersjs.com/guides/basics/rest.html).
 *
 * Example Directory Structure
 * .
 * ├── api  <-- configurable root directory - see config
 * │   ├── alpha.solos.js  <-- (DELETE|GET|PATCH|POST|PUT) http://domain.com/api/alpha
 * │   ├── alpha
 * │   │   ├── beta.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/beta
 * │   │   └── me  <-- 'me' is a special directory name that signals route parameters
 * │   │       ├── beta
 * │   │       │   └── me
 * │   │       │       └── gama.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/:alphaId/beta/:betaId/gama
 * │   │       └── delta.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/:alphaId/delta
 *
 */

/* eslint-enable */

'use strict';

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated **BUT NOT authorized** as this point
 * in the lifecycle.  This is called for every service method.
 */
exports.receive = async function receive(context) {
  context.log.debug('Callback successful', {
    method: 'receive',
  });
  return context;
};

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated **BUT NOT authorized** as this point
 * in the lifecycle.
 */
exports.receive_find = async function receive_find(context) {
  context.log.debug('Callback successful', {
    method: 'receive_find',
  });
  return context;
};

/**
 * Lifecycle function name for validating the user input.
 * This is called for every service method.
 */
exports.validate = async function validate(context) {
  context.log.debug('Callback successful', {
    method: 'validate',
  });
  return context;
};

/**
 * Lifecycle function name for validating the user input.
 */
exports.validate_find = async function validate_find(context) {
  context.log.debug('Callback successful', {
    method: 'validate_find',
  });
  return context;
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 * This is called for every service method.
 */
exports.authorize = async function authorize(context) {
  context.log.debug('Callback successful', {
    method: 'authorize',
  });
  return context;
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 */
exports.authorize_find = async function authorize_find(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_find',
  });
  return context;
};

/**
 * Lifecycle function name for pre-processing the request.
 * This is called for every service method.
 */
exports.before = async function before(context) {
  context.log.debug('Callback successful', {
    method: 'before',
  });
  return context;
};

/**
 * Lifecycle function name for pre-processing the request.
 */
exports.before_find = async function before_find(context) {
  context.log.debug('Callback successful', {
    method: 'before_find',
  });
  return context;
};

/**
 * Function name for processing the request.
 * JSON returned from this call is sent to the client.
 */
exports.find = async function find(params, log) {
  log.debug('Callback successful', {
    method: 'find',
  });
  return { message: 'Solos Lives!!!', params };
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if the serivce method was called.
 * This is called for every service method.
 */
exports.after = async function after(context) {
  context.log.debug('Callback successful', {
    method: 'after',
  });
  return context;
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if the service method was called.
 */
exports.after_find = async function after_find(context) {
  context.log.debug('Callback successful', {
    method: 'after_find',
  });
  return context;
};
