/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect jest*/


'use strict';


const feathers = require('@feathersjs/feathers');
const request = require('supertest');
const solos = require('../solos');
const callbacks = ['receive', 'validate', 'authorize', 'before', 'after'];
const calls = ['remove', 'get', 'find', 'patch', 'create', 'update'];
const params = {
  remove: [1],
  get: [2],
  find: [{}],
  patch: [3, {}, {}],
  create: [{}, {}],
  update: [4, {}, {}],
};


describe('Solos should...', () => {
  test('scan for method files and configure services with defaults', async() => {
    const app = feathers();
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };

    await solos.init(app);

    expect.assertions(Object.keys(bindings) + Object.keys(app.services).length);

    Object.entries(app.services).forEach(([path, service]) => {
      expect(path).toEqual(expect.stringMatching(/[^/]$/));
      Object.keys(bindings).forEach(binding => {
        if (service[binding]) {
          bindings[binding]++;
        }
      });
    });

    Object.entries(bindings).forEach(([binding, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });

  test('execute services with hooks and callbacks', async() => {
    const app = feathers();
    const mock = {};
    callbacks.forEach(callback => {
      mock[callback] = jest.fn(x => x);

      calls.forEach(call => {
        mock[`${callback}_${call}`] = jest.fn(x => x);
      });
    });

    calls.forEach(call => {
      mock[call] = jest.fn(x => x);
    });

    await solos.init(app, undefined, x => Object.assign({}, mock));

    const services = app.services;
    const keys = Object.keys(services);

    expect.assertions(calls.length * keys.length);

    await Promise.all(Object.entries(services).map(async([path, service]) => {
      await Promise.all(calls.map(async call => {
        if (service[call]) {
          const p = params[call];
          await service[call](...p);
          expect(mock[call]).toHaveBeenCalledTimes(keys.length);
        }
      }));
    }));
  });

  test('execute services with implementations hooks', async() => {
    const app = feathers();
    await solos.init(app);

    const services = app.services;

    expect.assertions(Object.keys(services).length);

    await Promise.all(Object.entries(services).map(async([path, service]) => {
      await Promise.all(calls.map(async call => {
        if (service[call]) {
          const p = params[call];
          expect(await service[call](...p)).toHaveProperty('message', 'Solos Lives!!!');
        }
      }));
    }));
  });

  test('configured through express respond to HTTP requests', async() => {

    const express = require('@feathersjs/express');
    const services = feathers();

    // This creates an app that is both, an Express and Feathers app
    const app = express(services);

    // Turn on JSON body parsing for REST services
    app.use(express.json());
    // Turn on URL-encoded body parsing for REST services
    app.use(express.urlencoded({ extended: true }));
    // Set up REST transport using Express
    app.configure(express.rest());

    await solos.init(app);

    // Set up an error handler that gives us nicer errors
    app.use(express.errorHandler());
    expect.assertions(16);

    post_alpha: {
      const res = await request(app).post('/test/api/alpha').expect(201);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
    }

    patch_beta: {
      const res = await request(app).patch('/test/api/beta/3').expect(200);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
      expect(res.body).toHaveProperty('id', '3');
    }

    delete_beta_zeta: {
      const res = await request(app).delete('/test/api/beta/3/zeta/4').expect(200);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
      expect(res.body).toHaveProperty('id', '4');
      expect(res.body).toHaveProperty('params.route.betaId', '3');
    }

    get_alpha_gama: {
      const res = await request(app).get('/test/api/alpha/3/gamma').expect(200);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
      expect(res.body).toHaveProperty('params.route.alphaId', '3');
    }

    get_alpha_gama_delta: {
      const res = await request(app).get('/test/api/alpha/3/gamma/4/delta/5').expect(200);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
      expect(res.body).toHaveProperty('id', '5');
      expect(res.body).toHaveProperty('params.route.alphaId', '3');
      expect(res.body).toHaveProperty('params.route.gammaId', '4');
    }

    put_alpha_gama_delta_epsilon: {
      const res = await request(app).put('/test/api/alpha/3/gamma/4/delta/epsilon/6').expect(200);
      expect(res.body).toHaveProperty('message', 'Solos Lives!!!');
      expect(res.body).toHaveProperty('id', '6');
      expect(res.body).toHaveProperty('params.route.alphaId', '3');
      expect(res.body).toHaveProperty('params.route.gammaId', '4');
    }

  });
});
