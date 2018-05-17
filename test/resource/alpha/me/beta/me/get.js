/**
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.receive = async function receive(context) {
  context.log.debug('Callback successful', {
    method: 'receive',
  });
  return context;
};

exports.validate = async function validate(context) {
  context.log.debug('Callback successful', {
    method: 'validate',
  });
  return context;
};

exports.authorize = async function authorize(context) {
  context.log.debug('Callback successful', {
    method: 'authorize',
  });
  return context;
};

exports.before = async function before(context) {
  context.log.debug('Callback successful', {
    method: 'before',
  });
  return context;
};

exports.respond = async function respond(context) {
  context.log.debug('Callback successful', {
    method: 'respond',
  });
  return { message: 'Solos Lives!!!' };
};

exports.after = async function after(context) {
  context.log.debug('Callback successful', {
    method: 'after',
  });
  return context;
};
