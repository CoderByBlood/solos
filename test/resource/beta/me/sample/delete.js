/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */

"use strict";

exports.request_received = function(msg, done) {
    msg.logger.debug("Callback successful", {method: "receive"});
    done(undefined, msg);
};

exports.authorize = function(msg, done) {
    msg.logger.debug("Callback successful", {method: "authorize"});
    done(undefined, msg);
};

exports.validate = function(msg, done) {
    msg.logger.debug("Callback successful", {method: "validate"});
    done(undefined, msg);
};

exports.before = function(msg, done) {
    msg.logger.debug("Callback successful", {method: "before"});
    done(undefined, msg);
};

exports.respond = function(msg, done) {
    msg.response.send("Solos Lives!!!");
    msg.logger.debug("Callback successful", {method: "respond"});
    done(undefined, msg);
};

exports.after = function(msg, done) {
    msg.logger.debug("Callback successful", {method: "after", context: msg});
    done(undefined, msg);
};