/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */

"use strict";

exports.bind = function (options, callback) {
    var error;

    try {
        var seneca = options.seneca;
        var param = options.param;

        var entity = seneca.make(param);
        entity.id = "5";
        entity.name = 'Orange';
        entity.price = 2.99;

        entity.save$(function (err, foo) {
            seneca.log.info(foo);
        });

        entity.load$(entity.id, function (err, foo) {
            seneca.log.info(foo);
        });

    } catch (err) {
        error = err;
    }

    callback(error);
};