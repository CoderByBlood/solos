/**
 * Copyright (c) 2015, Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const scanner = require('./scanner');
const entityBinder = require('./entity');
const methodBinder = require('./method');
const assembler = require('./assembler');
const processor = require('./processor');

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
exports.init = function init(router, seneca, config) {
  router.config = config;
  seneca.use(assembler, config);
  seneca.use(processor, config);
  seneca.use(scanner, config);
  seneca.use(entityBinder, {
    app: router,
  });
  seneca.use(methodBinder, {
    app: router,
  });
  seneca.act({
    role: 'solos',
    cmd: 'assemble',
  });
};


exports.REQUEST_RECEIVED = methodBinder.MethodBinder.REQUEST_RECEIVED;
exports.VALIDATE_REQUEST = methodBinder.MethodBinder.VALIDATE_REQUEST;
exports.AUTHORIZE_REQUEST = methodBinder.MethodBinder.AUTHORIZE_REQUEST;
exports.BEFORE_RESPONSE = methodBinder.MethodBinder.BEFORE_RESPONSE;
exports.RESPOND = methodBinder.MethodBinder.RESPOND;
exports.AFTER_RESPONSE = methodBinder.MethodBinder.AFTER_RESPONSE;
exports.REQUEST_CONTEXT = entityBinder.EntityBinder.REQUEST_CONTEXT;
