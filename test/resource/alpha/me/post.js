/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

/**
 *
 * @param msg
 * @param done
 */
exports.respond = function respond(msg) {
  msg.response.sendStatus(200);
  return Promise.resolve(msg);
};

/**
 *
 * @param msg
 * @param done
 */
exports.after = function after(msg) {
  return Promise.resolve(msg);
  //
};
