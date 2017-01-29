/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */
"use strict";

//These tests exercise code directly and do not require a running server

var should = require("should");
var assert = require("assert");
var authorization = require('express-authorization');
var Scanner = require("../scanner").Scanner;


describe('Solos Unit Tests', function () {
    describe("Scanner", function () {
        var subject = new Scanner();

        it("should return test:get::owner", function () {
            subject.generatePermission("test", "get", false).should.equal("test:get::owner");
        });

        it("should return test:get", function () {
            subject.generatePermission("test", "get", true).should.equal("test:get");
        });

        it("should get method from file name", function () {
            subject.getHttpMethodFromFileName("get.js").should.equal("get");
        });

        it("should match method by http method", function () {
            subject.isMethod("get.js").should.be.true();
        });

        it("should not match method by http method", function () {
            subject.isMethod("abcdefg.js").should.be.false();
        });

        it("should get entity name from file name", function () {
            subject.getEntityName("test-entity.js").should.equal("test");
        });

        it("should match entity regular expression", function () {
            subject.isEntity("test-entity.js").should.be.true();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity("testentity.js").should.be.false();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity("-entity.js").should.be.false();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity(" -entity.js").should.be.false();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity("--entity.js").should.be.false();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity("test-entity.jpg").should.be.false();
        });

        it("should not match entity regular expression", function () {
            subject.isEntity("test-entity").should.be.false();
        });

        it("should match 'me' parameter.", function () {
            subject.isParameter("me").should.be.true();
        });

        it("should not match 'me' parameter.", function () {
            subject.isParameter("notme").should.be.false();
        });

        it("should create parameter per template.", function () {
            subject.generateUriParam("test").should.equal(":test");
        });

        it("should override entity regex.", function () {
            var scanner = new Scanner({entityRegEx: /^([\w]+[-])+entity123[.]js$/});
            scanner.isEntity("test-entity123.js").should.be.true();
        });

        it("should override uri param regex.", function () {
            var scanner = new Scanner({uriParamRegEx: /^newme$/});
            scanner.isParameter("newme").should.be.true();
        });

        it("should override uri template.", function () {
            var scanner = new Scanner({uriParamTemplate: "{:param-newtemplate}"});
            scanner.generateUriParam("node").should.equal("{node-newtemplate}");
        });
    });

    describe("Express-Authorize", function () {
        it("should match this consumer statement for a get", function () {
            var claim = authorization.considerPermissions("*:*:456");
            claim.isPermitted("profile:get:456").should.be.true();
        });

        it("should match this consumer statement for a get", function () {
            var claim = authorization.considerPermissions("*:put");
            claim.isPermitted("profile:put").should.be.true();
        });
    });
});