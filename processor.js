/**
 * Copyright (c) 2016, Three Pawns, Inc. All rights reserved.
 */

"use strict";

module.exports = function process(options) {
    const seneca = this;

    this.add({role: "solos", cmd: "require"}, function (msg, respond) {
        let error;

        try {
            msg.module = require('./' + msg.path);
        } catch (err) {
            error = err;
        }

        respond(error, msg);
    });

    this.add({role: "solos", cmd: "process", target: "entity"}, function (msg, respond) {
        seneca.act({role: "solos", cmd: "require"}, msg, function (err, msg) {
            if (err) {
                respond(err, msg);
            } else {
                seneca.act({role: "solos", cmd: "bind"}, msg, respond);
            }
        });
    });

    this.add({role: "solos", cmd: "process", target: "method"}, function (msg, respond) {
        seneca.act({role: "solos", cmd: "require"}, msg, function (err, msg) {
            if (err) {
                respond(err, msg);
            } else {
                seneca.act({role: "solos", cmd: "bind"}, msg, respond);
            }
        });
    });
};