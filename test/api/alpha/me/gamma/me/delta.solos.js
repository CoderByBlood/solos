/**
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.receive_get = async function receive_get(context) {
  context.log.debug('Callback successful', {
    method: 'receive_get',
  });
  return context;
};

exports.validate_get = async function validate_get(context) {
  context.log.debug('Callback successful', {
    method: 'validate_get',
  });
  return context;
};

exports.authorize_get = async function authorize_get(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_get',
  });
  return context;
};

exports.before_get = async function before_get(context) {
  context.log.debug('Callback successful', {
    method: 'before_get',
  });
  return context;
};

exports.get = async function get(id, params, log) {
  log.debug('Callback successful', {
    method: 'get',
  });
  return { message: 'Solos Lives!!!', id, params };
};

exports.after_get = async function after_get(context) {
  context.log.debug('Callback successful', {
    method: 'after_get',
  });
  return context;
};
