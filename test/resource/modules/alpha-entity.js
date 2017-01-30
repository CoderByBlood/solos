/*
 * Copyright (c) 2015 by Three Pawns, Inc. All rights reserved.
 */

'use strict';

exports.bind = function bind(options, callback) {
  let error;

  try {
    const seneca = options.seneca;
    const param = options.param;

    const entity = seneca.make(param);
    entity.id = '5';
    entity.name = 'Apple';
    entity.price = 1.99;

    entity.save$((err, foo) => {
      seneca.log.info(foo);
    });

    entity.load$(entity.id, (err, foo) => {
      seneca.log.info(foo);
    });
  } catch (err) {
    error = err;
  }

  callback(error);
};
