/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.create = async function create(data, params, log) {
  return { message: 'Solos Lives!!!', data, params };
};

exports.after_create = async function after_create(context) {
  return context;
};
