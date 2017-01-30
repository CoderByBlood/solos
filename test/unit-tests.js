/*
 * Copyright (c) 2015 by Three Pawns, Inc.
 */

'use strict';

// These tests exercise code directly and do not require a running server

const authorization = require('express-authorization');
const Scanner = require('../scanner').Scanner;


describe('Solos Unit Tests', () => {
  describe('Scanner', () => {
    const subject = new Scanner();

    it('should return test:get::owner', () => {
      subject.generatePermission('test', 'get', false).should.equal('test:get::owner');
    });

    it('should return test:get', () => {
      subject.generatePermission('test', 'get', true).should.equal('test:get');
    });

    it('should get method from file name', () => {
      subject.getHttpMethodFromFileName('get.js').should.equal('get');
    });

    it('should match method by http method', () => {
      subject.isMethod('get.js').should.be.true();
    });

    it('should not match method by http method', () => {
      subject.isMethod('abcdefg.js').should.be.false();
    });

    it('should get entity name from file name', () => {
      subject.getEntityName('test-entity.js').should.equal('test');
    });

    it('should match entity regular expression', () => {
      subject.isEntity('test-entity.js').should.be.true();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity('testentity.js').should.be.false();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity('-entity.js').should.be.false();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity(' -entity.js').should.be.false();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity('--entity.js').should.be.false();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity('test-entity.jpg').should.be.false();
    });

    it('should not match entity regular expression', () => {
      subject.isEntity('test-entity').should.be.false();
    });

    it('should match "me" parameter.', () => {
      subject.isParameter('me').should.be.true();
    });

    it('should not match "me" parameter.', () => {
      subject.isParameter('notme').should.be.false();
    });

    it('should create parameter per template.', () => {
      subject.generateUriParam('test').should.equal(':test');
    });

    it('should override entity regex.', () => {
      const scanner = new Scanner({
        entityRegEx: /^([\w]+[-])+entity123[.]js$/,
      });
      scanner.isEntity('test-entity123.js').should.be.true();
    });

    it('should override uri param regex.', () => {
      const scanner = new Scanner({
        uriParamRegEx: /^newme$/,
      });
      scanner.isParameter('newme').should.be.true();
    });

    it('should override uri template.', () => {
      const scanner = new Scanner({
        uriParamTemplate: '{:param-newtemplate}',
      });
      scanner.generateUriParam('node').should.equal('{node-newtemplate}');
    });
  });

  describe('Express-Authorize', () => {
    it('should match this consumer statement for a get', () => {
      const claim = authorization.considerPermissions('*:*:456');
      claim.isPermitted('profile:get:456').should.be.true();
    });

    it('should match this consumer statement for a get', () => {
      const claim = authorization.considerPermissions('*:put');
      claim.isPermitted('profile:put').should.be.true();
    });
  });
});
