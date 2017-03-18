/*
 * Copyright (c) 2015 by Three Pawns, Inc. All rights reserved.
 */

'use strict';

exports.request_received = function requestReceived(msg) {
  msg.logger.debug('Callback successful', {
    method: 'receive',
  });
  return Promise.resolve(msg);
};

exports.authorize = function authorize(msg) {
  msg.logger.debug('Callback successful', {
    method: 'authorize',
  });
  return Promise.resolve(msg);
};

exports.validate = function validate(msg) {
  msg.logger.debug('Callback successful', {
    method: 'validate',
  });
  return Promise.resolve(msg);
};

exports.before = function before(msg) {
  msg.logger.debug('Callback successful', {
    method: 'before',
  });
  return Promise.resolve(msg);
};

exports.respond = function respond(msg) {
  msg.response.send('Solos Lives!!!');
  msg.logger.debug('Callback successful', {
    method: 'respond',
  });
  return Promise.resolve(msg);
};

exports.after = function after(msg) {
  msg.logger.debug('Callback successful', {
    method: 'after',
    context: msg,
  });
  return Promise.resolve(msg);
};
