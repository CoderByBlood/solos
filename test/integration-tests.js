/*
 * Copyright (c) 2015 by Three Pawns, Inc. All rights reserved.
 */

'use strict';

const Events = require('events');
const UUID = require('uuid');
const should = require('should');
const express = require('express');
const solos = require('../solos');
const mocks = require('node-mocks-http');

const MethodBinder = require('../method').MethodBinder;
const EntityBinder = require('../entity').EntityBinder;

const noOp = function () {};

const createEntityBinder = function (seneca) {
  const entityBinder = new EntityBinder({});
  entityBinder.seneca = seneca;
  entityBinder.logger = seneca.log;
  return entityBinder;
};

const createMethodBinder = function (seneca) {
  const methodBinder = new MethodBinder({
    get: noOp,
  });
  methodBinder.seneca = seneca;
  methodBinder.logger = seneca.log;
  return methodBinder;
};

const createRequest = function () {
  const id = UUID.v4();
  return mocks.createRequest({
    method: 'GET',
    url: `/user/${id}`,
    params: {
      id,
    },
  });
};

const createResponse = function () {
  const res = mocks.createResponse({
    eventEmitter: Events.EventEmitter,
  });
  res.on('end', () => {
    res.headersSent = true;
  });
  res.headersSent = false;
  return res;
};

describe('solos Integration Tests', () => {
  /* eslint-disable global-require */
  const seneca = require('seneca')();
  const method = require('./resource/alpha/me/sample/get');
  /* eslint-enable */

  seneca.use('scanner', {
    resource: {
      path: './test/resource',
    },
  });
  method.isAuthorized = noOp;

  describe('scanner', () => {
    it('should send a method-found-to-be-processed message', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.process.method',
      };
      const errors = [];

      seneca.add({
        role: 'solos',
        cmd: 'process',
        target: 'method',
      }, (msg, respond) => {
        let error;

        try {
          should.exist(msg);
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

      seneca.act({
        role: 'solos',
        cmd: 'scan',
      }, (err) => {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (error) => {
          done(errors[0] || error);
        });
      });
    });

    it('should send an entity-found-to-be-processed message', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.process.entity',
      };
      const errors = [];

      seneca.add({
        role: 'solos',
        cmd: 'process',
        target: 'entity',
      }, (msg, respond) => {
        let error;

        try {
          should.exist(msg);
          msg.should.have.property('resource');
          msg.should.have.property('path');
          msg.should.have.property('name');
        } catch (err) {
          error = err;
          errors.push(error);
        }

        respond(error, msg);
      });

      seneca.act({
        role: 'solos',
        cmd: 'scan',
      }, (err) => {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (error) => {
          done(errors[0] || error);
        });
      });
    });

    it('should scan the resource tree', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.scan',
      };
      const nodes = {};

      seneca.add({
        role: 'solos',
        cmd: 'process',
        target: 'entity',
      }, (msg) => {
        nodes[msg.resource] = msg.path;
      });
      seneca.add({
        role: 'solos',
        cmd: 'process',
        target: 'method',
      }, (msg) => {
        nodes[msg.resource] = `${msg.path} ${msg.uri} ${msg.permission}`;
      });

      seneca.act({
        role: 'solos',
        cmd: 'scan',
      }, (err) => {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, () => {
          let error;

          try {
            nodes.should.containEql('put.js');
            nodes.should.containEql('get.js');
            nodes.should.containEql('post.js');
            nodes.should.containEql('delete.js');
            nodes.should.containEql('alpha-entity.js');
            nodes.should.containEql('beta-entity.js');

            nodes['put.js'].should.equal('./test/resource/alpha/me/beta/me/gama/put.js /alpha/:alpha/beta/:beta/gama gama:put::owner');
            nodes['post.js'].should.equal('./test/resource/alpha/me/post.js /alpha/:alpha alpha:post');
            nodes['get.js'].should.equal('./test/resource/alpha/me/sample/get.js /alpha/:alpha/sample sample:get::owner');
            nodes['alpha-entity.js'].should.equal('./test/resource/modules/alpha-entity.js');
            nodes['delete.js'].should.equal('./test/resource/beta/me/sample/delete.js /beta/:beta/sample sample:delete::owner');
            nodes['beta-entity.js'].should.equal('./test/resource/modules/beta-entity.js');
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      });
    });
  });

  describe('EntityBinder', () => {
    seneca.use('entity');

    it('should load Entity and continue processing upon success', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.entity.load.found',
      };
      const entityBinder = createEntityBinder(seneca);
      const param = 'alpha';
      const id = '5';
      const req = createRequest();
      const res = createResponse();
      const loadEntity = entityBinder.loadEntity(param);
      const next = function (err, result) {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (errd) => {
          let error;

          try {
            should.not.exist(errd);
            should.exist(result);
            res.statusCode.should.equal(200);
            req.should.have.property(EntityBinder.REQUEST_CONTEXT);
            req[EntityBinder.REQUEST_CONTEXT].should.have.property('entities');
            req[EntityBinder.REQUEST_CONTEXT].entities.should.have.property(param);
            req[EntityBinder.REQUEST_CONTEXT].entities[param].id.should.equal(id);
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      };

      const entity = seneca.make(param);
      entity.id = id;
      entity.name = 'Apple';
      entity.price = 1.99;

      entity.save$((err, foo) => {
        seneca.log.info(foo);
      });

      loadEntity(req, res, next, id);
    });

    it('should send 404 status and stop processing upon not finding the entity', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.entity.load.notFound',
      };
      const entityBinder = createEntityBinder(seneca);
      const param = 'alpha';
      const id = '6';
      const req = createRequest();
      const res = createResponse();
      const loadEntity = entityBinder.loadEntity(param);
      const next = function (err) {
        // test
        seneca.add(test, (msg, respond) => {
          let error;

          try {
            should.exist(err);
            res.statusCode.should.equal(404);
          } catch (caught) {
            error = caught;
          }

          respond(error, msg);
        });

        // post test
        seneca.act(test, (errd) => {
          done(errd);
        });
      };

      seneca.add({
        role: 'entity',
        cmd: 'load',
        name: param,
        id,
      }, (msg, respond) => {
        respond();
      });

      loadEntity(req, res, next, id);
    });

    it('should send 500 status and stop processing upon failing to load the entity', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.entity.load.failed',
      };
      const entityBinder = createEntityBinder(seneca);
      const param = 'alpha';
      const id = '7';
      const req = createRequest();
      const res = createResponse();
      const loadEntity = entityBinder.loadEntity(param);

      const next = function (err) {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (errd) => {
          let error;

          try {
            should.exist(errd);
            res.statusCode.should.equal(500);
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      };

      seneca.add({
        role: 'entity',
        cmd: 'load',
        name: param,
      }, (msg, respond) => {
        respond(new Error('test should fail'), msg);
      });

      loadEntity(req, res, next, id);
    });

    it('should send 500 status and stop processing upon failing to load the entity', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.entity.load.failed',
      };
      const entityBinder = createEntityBinder(seneca);
      const param = 'alpha';
      const id = '8';
      const req = createRequest();
      const res = createResponse();
      const loadEntity = entityBinder.loadEntity(param);

      const next = function (err) {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (errd) => {
          let error;

          try {
            should.exist(errd);
            res.statusCode.should.equal(500);
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      };

      seneca.add({
        role: 'entity',
        cmd: 'load',
        name: param,
      }, (msg, respond) => {
        respond(new Error('test should fail'), msg);
      });

      loadEntity(req, res, next, id);
    });
  });

  describe('MethodBinder', () => {
    it('should send 405 status for missing method binding at call time', (done) => {
      const methodBinder = createMethodBinder(seneca);
      const methodName = 'get';
      const uri = '/user/5';
      const req = createRequest();
      const res = createResponse();
      const executeMethod = methodBinder.executeMethod({
        methodName,
        uri,
      });

      executeMethod(req, res, (err) => {
        // test
        let error;

        try {
          should.exist(err);
          res.statusCode.should.equal(405);
        } catch (caught) {
          error = caught;
        }

        done(error);
      });
    });

    it('should ensure that request and response are in msg', (done) => {
      const methodBinder = createMethodBinder(seneca);
      const methodName = 'get';
      const uri = '/user/6';
      const req = createRequest();
      const res = createResponse();
      const execMethod = {
        methodName,
        uri,
      };
      const executeMethod = methodBinder.executeMethod(execMethod);

      execMethod[MethodBinder.REQUEST_RECEIVED] = (msg, respond) => {
        let error;

        try {
          msg.should.have.property('req');
          msg.should.have.property('res');
          // we don't want a 405 error
          msg.res.sendStatus(200);
        } catch (err) {
          error = err;
        }

        respond(error, msg);
      };

      executeMethod(req, res, (err) => {
        done(err);
      });
    });

    it('should send 200 status for successful method binding at call time', (done) => {
      const methodBinder = createMethodBinder(seneca);
      const methodName = 'get';
      const uri = '/user/7';
      const req = createRequest();
      const res = createResponse();
      const execMethod = {
        methodName,
        uri,
      };
      const executeMethod = methodBinder.executeMethod(execMethod);

      execMethod[MethodBinder.REQUEST_RECEIVED] = (msg, respond) => {
        let error;

        try {
          msg.res.sendStatus(200);
        } catch (err) {
          error = err;
        }

        respond(error, msg);
      };

      executeMethod(req, res, (err) => {
        let error = err;

        if (!error) {
          try {
            res.statusCode.should.equal(200);
          } catch (caught) {
            error = caught;
          }
        }

        done(error);
      });
    });

    it('should intercept method invocations to apply ACLs', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.method.acl.intercept',
      };
      const methodBinder = createMethodBinder(seneca);
      const methodName = 'get';
      const uri = '/user/8';
      const req = createRequest();
      const res = createResponse();
      const executeMethod = methodBinder.executeMethod(method);
      const methodMsg = {
        method,
        httpMethod: methodName,
        uri,
      };

      method[MethodBinder.PERMISSION] = 'profile:get::owner';
      method[MethodBinder.AUTHORIZE_REQUEST] = undefined;
      req.user = {
        id: '456',
        roles: ['*:*:456'],
      };
      should.not.exist(method[MethodBinder.AUTHORIZE_REQUEST]);
      methodBinder.bind(methodMsg);
      executeMethod(req, res, (err) => {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, () => {
          let error;

          try {
            should.exist(method[MethodBinder.AUTHORIZE_REQUEST]);
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      });
    });

    it('should send 403 status when call violates ACLs', (done) => {
      const test = {
        role: 'test',
        cmd: 'solos.method.acl.violated.403',
      };
      const methodBinder = createMethodBinder(seneca);
      const methodName = 'get';
      const uri = '/user/9';
      const req = createRequest();
      const res = createResponse();
      const executeMethod = methodBinder.executeMethod(method);
      const methodMsg = {
        method,
        httpMethod: methodName,
        uri,
      };

      method[MethodBinder.PERMISSION] = undefined;
      method[MethodBinder.AUTHORIZE_REQUEST] = undefined;
      req.user = {
        id: '456',
        roles: ['*:*:456'],
      };

      should.not.exist(method[MethodBinder.AUTHORIZE_REQUEST]);
      methodBinder.bind(methodMsg);
      executeMethod(req, res, (err) => {
        // test
        seneca.add(test, (msg, respond) => {
          respond(err, msg);
        });

        // post test
        seneca.act(test, (errd) => {
          let error = errd;

          try {
            // 403 is an error so clear it
            if (error) {
              error = undefined;
            }

            should.exist(method[MethodBinder.AUTHORIZE_REQUEST]);
            res.statusCode.should.equal(403);
          } catch (caught) {
            error = caught;
          }

          done(error);
        });
      });
    });
  });

  describe('solos', () => {
    it('Should add a prototype called config to router', () => {
      const router = express.Router();

      /* eslint-disable global-require */
      const config = require('../config.json');
      /* eslint-enable */

      solos.init(router, seneca, config);

      router.should.have.property('config');
    });
  });
});
