/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.receive_update = async function receive_update(context) {
  context.log.debug('Callback successful', {
    method: 'receive_update',
  });
  return context;
};

exports.validate_update = async function validate_update(context) {
  context.log.debug('Callback successful', {
    method: 'validate_update',
  });
  return context;
};

exports.authorize_update = async function authorize_update(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_update',
  });
  return context;
};

exports.before_update = async function before_update(context) {
  context.log.debug('Callback successful', {
    method: 'before_update',
  });
  return context;
};

exports.update = async function update(id, data, params, log) {
  log.debug('Callback successful', {
    method: 'update',
  });
  return { message: 'Solos Lives!!!', id, data, params };
};

exports.after_update = async function after_update(context) {
  context.log.debug('Callback successful', {
    method: 'after_update',
  });
  return context;
};
