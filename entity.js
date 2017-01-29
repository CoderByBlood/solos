/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */

"use strict";

/**
 * Loads Entities from ORM and adds them to req[solos_context].entities before the
 * lifecycle functions are invoked
 *
 * @param application The ORM Application
 * @constructor
 */
function EntityBinder(application) {

    this.app = application;
    this.seneca = undefined;
    this.logger = undefined;
}

/**
 * Key into request for the context passed to the lifecycle functions
 *
 * @type {string}
 */
EntityBinder.REQUEST_CONTEXT = "solos_context";

/**
 * Initializes the req[solos_context] unless already initialized
 *
 * @param req The request
 * @param res The response
 */
EntityBinder.prototype.prepareRequest = function (req, res) {
    let context = req[EntityBinder.REQUEST_CONTEXT];

    if (!context) {
        context = {entities: {}};
        req[EntityBinder.REQUEST_CONTEXT] = context;
    }
};

/**
 * Returns a closure around 'param' that is bindable into express.param
 *
 * @param param the request URI parameter bound
 * @returns {Function} A closure that is bindable into express.param(param, ...) with the signature (req, res, next, id)
 */
EntityBinder.prototype.loadEntity = function (param) {
    const _this = this;
    return function (req, res, next, id) {
        _this.seneca.make(param).load$(id, function (err, found) {
            if (err) {
                res.sendStatus(500);
                next(err);
            } else if (found) {
                _this.prepareRequest(req, res);
                req[EntityBinder.REQUEST_CONTEXT].entities[param] = found;
                next(undefined, found);
            } else {
                res.sendStatus(404);
                const failed = new Error('Did Not Find ' + param);
                next(failed);
            }
        });
    };
};

/**
 * Binds the Entity from a URI Path into req[solos_context].entities
 *
 * @param msg The message containing the Entity and the parameter to bind into req[solos_context].entities
 */
EntityBinder.prototype.bind = function (msg) {
    const _this = this;
    const param = msg.param;
    const entity = msg.entity;
    const hasBind = typeof entity.bind === typeof Function;
    this.logger.debug("Binding Entity", {entity: param, hasBindCallback: hasBind});

    const callback = function (err) {
        if (err) {
            _this.logger.error("Entity Bind Unsccessful", err);
            throw err;
        } else {
            _this.app.param(param, _this.loadEntity(param));
        }
    };

    if (hasBind) {
        entity.bind({param: param, seneca: this.seneca, express: this.app}, callback);
    } else {
        callback();
    }

};

module.exports = function bind(options) {
    const seneca = this;
    const binder = new EntityBinder(options.app);

    binder.seneca = seneca;
    binder.logger = seneca.log;

    this.add({role: "solos", cmd: "bind", target: "entity"}, function (msg, respond) {
        binder.bind({param: msg.name, entity: msg.module});
        respond(undefined, {binder: binder});
    });
};

module.exports.EntityBinder = EntityBinder;