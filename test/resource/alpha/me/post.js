/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

exports.respond = async function respond(context) {
  return { message: 'Solos Lives!!!' };
};

exports.after = async function after(context) {
  return context;
};
