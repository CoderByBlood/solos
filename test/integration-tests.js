/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */

"use strict";

var Events = require('events');
var UUID = require('uuid');
var should = require("should");
var assert = require("assert");
var express = require("express");
var solos = require("../solos");
var mocks = require('node-mocks-http');

var MethodBinder = require("../method").MethodBinder;
var EntityBinder = require("../entity").EntityBinder;

var no_op = function () {
};

var createEntityBinder = function (seneca) {
    var entityBinder = new EntityBinder({});
    entityBinder.seneca = seneca;
    entityBinder.logger = seneca.log;
    return entityBinder;
};

var createMethodBinder = function (seneca) {
    var methodBinder = new MethodBinder({get: no_op});
    methodBinder.seneca = seneca;
    methodBinder.logger = seneca.log;
    return methodBinder;
};

var createRequest = function () {
    var id = UUID.v4();
    return mocks.createRequest({
        method: 'GET',
        url: '/user/' + id,
        params: {id: id}
    });
};

var createResponse = function () {
    var res = mocks.createResponse({eventEmitter: Events.EventEmitter});
    res.on('end', function () {
        res.headersSent = true;
    });
    res.headersSent = false;
    return res;
};

describe('solos Integration Tests', function () {
    var seneca = require("seneca")();
    var method = require("./resource/alpha/me/sample/get");

    seneca.use("scanner", {resource: {path: "./test/resource"}});
    method.isAuthorized = no_op;

    describe("scanner", function () {
        it("should send a method-found-to-be-processed message", function (done) {
            var test = {role: "test", cmd: "solos.process.method"};
            var errors = [];

            seneca.add({role: "solos", cmd: "process", target: "method"}, function (msg, respond) {
                var error;

                try {
                    should(msg).not.be.undefined();
                    msg.should.have.property('resource');
                    msg.should.have.property('path');
                    msg.should.have.property('uri');
                    msg.should.have.property('method');
                    msg.should.have.property('permission');
                } catch (err) {
                    error = err;
                    errors.push(error);
                }

                respond(error, msg);
            });

            seneca.act({role: "solos", cmd: "scan"}, function (err, res) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, res) {
                    done(errors[0] || err);
                });
            });
        });

        it("should send an entity-found-to-be-processed message", function (done) {
            var test = {role: "test", cmd: "solos.process.entity"};
            var errors = [];

            seneca.add({role: "solos", cmd: "process", target: "entity"}, function (msg, respond) {
                var error;

                try {
                    should(msg).not.be.undefined();
                    msg.should.have.property('resource');
                    msg.should.have.property('path');
                    msg.should.have.property('name');
                } catch (err) {
                    error = err;
                    errors.push(error);
                }

                respond(error, msg);
            });

            seneca.act({role: "solos", cmd: "scan"}, function (err, msg) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    done(errors[0] || err);
                });
            });
        });

        it("should scan the resource tree", function (done) {
            var test = {role: "test", cmd: "solos.scan"};
            var nodes = {};

            seneca.add({role: "solos", cmd: "process", target: "entity"}, function (msg, respond) {
                nodes[msg.resource] = msg.path;
            });
            seneca.add({role: "solos", cmd: "process", target: "method"}, function (msg, respond) {
                nodes[msg.resource] = msg.path + ' ' + msg.uri + ' ' + msg.permission;
            });

            seneca.act({role: "solos", cmd: "scan"}, function (err, res) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error;

                    try {
                        nodes.should.containEql("put.js");
                        nodes.should.containEql("get.js");
                        nodes.should.containEql("post.js");
                        nodes.should.containEql("delete.js");
                        nodes.should.containEql("alpha-entity.js");
                        nodes.should.containEql("beta-entity.js");

                        nodes["put.js"].should.equal("./test/resource/alpha/me/beta/me/gama/put.js /alpha/:alpha/beta/:beta/gama gama:put::owner");
                        nodes["post.js"].should.equal("./test/resource/alpha/me/post.js /alpha/:alpha alpha:post");
                        nodes["get.js"].should.equal("./test/resource/alpha/me/sample/get.js /alpha/:alpha/sample sample:get::owner");
                        nodes["alpha-entity.js"].should.equal("./test/resource/modules/alpha-entity.js");
                        nodes["delete.js"].should.equal("./test/resource/beta/me/sample/delete.js /beta/:beta/sample sample:delete::owner");
                        nodes["beta-entity.js"].should.equal("./test/resource/modules/beta-entity.js");

                    } catch (err) {
                        error = err;
                    }

                    done(error);
                });
            });
        });
    });

    describe("EntityBinder", function () {
        seneca.use('entity');

        it("should load Entity and continue processing upon success", function (done) {
            var test = {role: "test", cmd: "solos.entity.load.found"};
            var entityBinder = createEntityBinder(seneca);
            var param = "alpha";
            var id = "5";
            var req = createRequest();
            var res = createResponse();
            var loadEntity = entityBinder.loadEntity(param);
            var next = function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error;

                    try {
                        should(err).be.undefined();
                        should(result).not.be.undefined();
                        res.statusCode.should.equal(200);
                        req.should.have.property(EntityBinder.REQUEST_CONTEXT);
                        req[EntityBinder.REQUEST_CONTEXT].should.have.property("entities");
                        req[EntityBinder.REQUEST_CONTEXT].entities.should.have.property(param);
                        req[EntityBinder.REQUEST_CONTEXT].entities[param].id.should.equal(id);
                    } catch (err) {
                        error = err;
                    }

                    done(err);
                });
            };

            var entity = seneca.make(param);
            entity.id = id;
            entity.name = 'Apple';
            entity.price = 1.99;

            entity.save$(function (err, foo) {
                seneca.log.info(foo);
            });

            loadEntity(req, res, next, id);
        });

        it("should send 404 status and stop processing upon not finding the entity", function (done) {
            var test = {role: "test", cmd: "solos.entity.load.notFound"};
            var entityBinder = createEntityBinder(seneca);
            var param = "alpha";
            var id = "6";
            var req = createRequest();
            var res = createResponse();
            var loadEntity = entityBinder.loadEntity(param);
            var next = function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    var error;

                    try {
                        should(err).not.be.undefined();
                        res.statusCode.should.equal(404);
                    } catch (err) {
                        error = err;
                    }

                    respond(error, msg);
                });

                //post test
                seneca.act(test, function (err, res) {
                    done(err);
                });
            };

            seneca.add({role: "entity", cmd: "load", name: param, id: id}, function (msg, respond) {
                respond();
            });

            loadEntity(req, res, next, id);
        });

        it("should send 500 status and stop processing upon failing to load the entity", function (done) {
            var test = {role: "test", cmd: "solos.entity.load.failed"};
            var entityBinder = createEntityBinder(seneca);
            var param = "alpha";
            var id = "7";
            var req = createRequest();
            var res = createResponse();
            var loadEntity = entityBinder.loadEntity(param);

            var next = function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error;

                    try {
                        should(err).not.be.undefined();
                        res.statusCode.should.equal(500);
                    } catch (err) {
                        error = err;
                    }

                    done(error);
                });
            };

            seneca.add({role: "entity", cmd: "load", name: param}, function (msg, respond) {
                respond(new Error("test should fail"), msg);
            });

            loadEntity(req, res, next, id);
        });

        it("should send 500 status and stop processing upon failing to load the entity", function (done) {
            var test = {role: "test", cmd: "solos.entity.load.failed"};
            var entityBinder = createEntityBinder(seneca);
            var param = "alpha";
            var id = "8";
            var req = createRequest();
            var res = createResponse();
            var loadEntity = entityBinder.loadEntity(param);

            var next = function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error;

                    try {
                        should(err).not.be.undefined();
                        res.statusCode.should.equal(500);
                    } catch (err) {
                        error = err;
                    }

                    done(error);
                });
            };

            seneca.add({role: "entity", cmd: "load", name: param}, function (msg, respond) {
                respond(new Error("test should fail"), msg);
            });

            loadEntity(req, res, next, id);
        });
    });

    describe("MethodBinder", function () {
        it("should send 405 status for missing method binding at call time", function (done) {
            var test = {role: "test", cmd: "solos.method.error.405"};
            var methodBinder = createMethodBinder(seneca);
            var methodName = "get";
            var uri = '/user/' + 5;
            var req = createRequest();
            var res = createResponse();
            var executeMethod = methodBinder.executeMethod({methodName: methodName, uri: uri});

            executeMethod(req, res, function (err, result) {
                //test
                var error;

                try {
                    should(err).not.be.undefined();
                    res.statusCode.should.equal(405);
                } catch (err) {
                    error = err;
                }

                done(error);
            });
        });

        it("should ensure that request and response are in msg", function (done) {
            var test = {role: "test", cmd: "solos.method.msg"};
            var methodBinder = createMethodBinder(seneca);
            var methodName = "get";
            var uri = '/user/' + 6;
            var req = createRequest();
            var res = createResponse();
            var method = {methodName: methodName, uri: uri};
            var executeMethod = methodBinder.executeMethod(method);

            method[MethodBinder.REQUEST_RECEIVED] = function (msg, respond) {
                var error;

                try {
                    msg.should.have.property("req");
                    msg.should.have.property("res");
                    //we don't want a 405 error
                    msg.res.sendStatus(200);
                } catch (err) {
                    error = err;
                }

                respond(error, msg);
            };

            executeMethod(req, res, function (err, result) {
                done(err);
            });
        });

        it("should send 200 status for successful method binding at call time", function (done) {
            var test = {role: "test", cmd: "solos.method.success.200"};
            var methodBinder = createMethodBinder(seneca);
            var methodName = "get";
            var uri = '/user/' + 7;
            var req = createRequest();
            var res = createResponse();
            var method = {methodName: methodName, uri: uri};
            var executeMethod = methodBinder.executeMethod(method);

            method[MethodBinder.REQUEST_RECEIVED] = function (msg, respond) {
                var error;

                try {
                    msg.res.sendStatus(200);
                } catch (err) {
                    error = err;
                }

                respond(error, msg);
            };

            executeMethod(req, res, function (err, result) {
                var error = err;

                if (!error) {
                    try {
                        res.statusCode.should.equal(200);
                    } catch (err) {
                        error = err;
                    }
                }

                done(error);
            });
        });

        it("should intercept method invocations to apply ACLs", function (done) {
            var test = {role: "test", cmd: "solos.method.acl.intercept"};
            var methodBinder = createMethodBinder(seneca);
            var methodName = "get";
            var uri = '/user/' + 8;
            var req = createRequest();
            var res = createResponse();
            var executeMethod = methodBinder.executeMethod(method);
            var methodMsg = {method: method, httpMethod: methodName, uri: uri};

            method[MethodBinder.PERMISSION] = "profile:get::owner";
            method[MethodBinder.AUTHORIZE_REQUEST] = undefined;
            req.user = {
                id: "456",
                roles: ["*:*:456"]
            };
            should(method[MethodBinder.AUTHORIZE_REQUEST]).be.undefined();
            methodBinder.bind(methodMsg);
            executeMethod(req, res, function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error;

                    try {
                        should(method[MethodBinder.AUTHORIZE_REQUEST]).not.be.undefined();
                    } catch (err) {
                        error = err;
                    }

                    done(error);
                });
            });
        });

        it("should send 403 status when call violates ACLs", function (done) {
            var test = {role: "test", cmd: "solos.method.acl.violated.403"};
            var methodBinder = createMethodBinder(seneca);
            var methodName = "get";
            var uri = '/user/' + 9;
            var req = createRequest();
            var res = createResponse();
            var executeMethod = methodBinder.executeMethod(method);
            var methodMsg = {method: method, httpMethod: methodName, uri: uri};

            method[MethodBinder.PERMISSION] = undefined;
            method[MethodBinder.AUTHORIZE_REQUEST] = undefined;
            req.user = {
                id: "456",
                roles: ["*:*:456"]
            };

            should(method[MethodBinder.AUTHORIZE_REQUEST]).be.undefined();
            methodBinder.bind(methodMsg);
            executeMethod(req, res, function (err, result) {
                //test
                seneca.add(test, function (msg, respond) {
                    respond(err, msg);
                });

                //post test
                seneca.act(test, function (err, msg) {
                    var error = err;

                    try {
                        //403 is an error so clear it
                        if (error) {
                            error = undefined;
                        }

                        should(method[MethodBinder.AUTHORIZE_REQUEST]).not.be.undefined();
                        res.statusCode.should.equal(403);
                    } catch (err) {
                        error = err;
                    }

                    done(error);
                });
            });
        });
    });

    describe("solos", function () {
        it("Should add a prototype called config to router", function () {
            var app = express();
            var router = express.Router();
            var config = require("../config.json");

            solos.init(router, seneca, config);

            router.should.have.property('config');
        });
    });
});