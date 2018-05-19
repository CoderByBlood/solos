/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect jest*/


'use strict';


const feathers = require('@feathersjs/feathers');
const solos = require('../main');
const app = feathers();
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
});
