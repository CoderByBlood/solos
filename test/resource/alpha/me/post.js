/*
 * Copyright (c) 2015 by Three Pawns, Inc. All rights reserved.
 */

'use strict';

/**
 *
 * @param msg
 * @param done
 */
exports.respond = function(msg, done) {
    msg.response.sendStatus(200);
    done(undefined, msg);
};

/**
 *
 * @param msg
 * @param done
 */
exports.after = function(msg, done) {
    done(undefined, msg);
    //
};
