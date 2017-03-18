/*
 * Copyright (c) 2015 by Three Pawns, Inc. All rights reserved.
 */

'use strict';

exports.bind = function bind(options) {
  return new Promise((resolve, reject) => {
    try {
      const seneca = options.seneca;
      const param = options.param;

      const entity = seneca.make(param);
      entity.id = '5';
      entity.name = 'Orange';
      entity.price = 2.99;

      entity.save$((err, foo) => {
        seneca.log.info(foo);
      });

      entity.load$(entity.id, (err, foo) => {
        seneca.log.info(foo);
      });
    } catch (err) {
      reject(err);
    }

    resolve(options);
  });
};
