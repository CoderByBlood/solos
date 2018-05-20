/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.receive_remove = async function receive_remove(context) {
  context.log.debug('Callback successful', {
    method: 'receive_remove',
  });
  return context;
};

exports.validate_remove = async function validate_remove(context) {
  context.log.debug('Callback successful', {
    method: 'validate_remove',
  });
  return context;
};

exports.authorize_remove = async function authorize_remove(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_remove',
  });
  return context;
};

exports.before_remove = async function before_remove(context) {
  context.log.debug('Callback successful', {
    method: 'before_remove',
  });
  return context;
};

exports.remove = async function remove(id, params, log) {
  log.debug('Callback successful', {
    method: 'remove',
  });
  return { message: 'Solos Lives!!!', id, params };
};

exports.after_remove = async function after_remove(context) {
  context.log.debug('Callback successful', {
    method: 'after_remove',
  });
  return context;
};
