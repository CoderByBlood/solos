/**
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.receive_patch = async function receive_patch(context) {
  context.log.debug('Callback successful', {
    method: 'receive_patch',
  });
  return context;
};

exports.validate_patch = async function validate_patch(context) {
  context.log.debug('Callback successful', {
    method: 'validate_patch',
  });
  return context;
};

exports.authorize_patch = async function authorize_patch(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_patch',
  });
  return context;
};

exports.before_patch = async function before_patch(context) {
  context.log.debug('Callback successful', {
    method: 'before_patch',
  });
  return context;
};

exports.patch = async function patch(id, data, params, log) {
  log.debug('Callback successful', {
    method: 'patch',
  });
  return { message: 'Solos Lives!!!', id, data, params };
};

exports.after_patch = async function after_patch(context) {
  context.log.debug('Callback successful', {
    method: 'after_patch',
  });
  return context;
};
