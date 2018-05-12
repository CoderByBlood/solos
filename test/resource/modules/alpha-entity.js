/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

/**
 * This is called as the parameter is bound into express at load time.
 * 'seneca.make(param).load$(id, (err, found) => { ... });' is called at runtime.
 * Seneca can be accessed through 'options.seneca' and param can be accessed
 * through 'options.param'.
 * The callback has the standrard callback(error, result) signature.  However, only
 * the error parameter in the callback is inspected.
 */
exports.bind = function bind(options) {
  return new Promise((resolve, reject) => {
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
      reject(err);
    }

    resolve(options);
  });
};
