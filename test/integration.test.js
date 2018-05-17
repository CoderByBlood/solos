/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect jest*/


'use strict';


const feathers = require('@feathersjs/feathers');
const solos = require('../solos');
const app = feathers();


describe('Solos should...', () => {

  test('execute services with hooks and valid callbacks', async() => {
    const callbacks = ['receive', 'validate', 'authorize', 'before', 'respond', 'after', ];
    const mock = {};
    callbacks.forEach(callback => {
      mock[callback] = jest.fn(x => x);
    });

    expect.assertions(callbacks.length);
    await solos.init(app, undefined, x => mock);

    const services = app.services;
    const keys = Object.keys(services);

    await Promise.all(Object.entries(services).map(async([path, service]) => {
      if (service['remove']) {
        await service['remove'](1);
      }
      else if (service['get']) {
        await service['get'](2);
      }
      else if (service['find']) {
        await service['find']({});
      }
      else if (service['patch']) {
        await service['patch'](3, {}, {});
      }
      else if (service['update']) {
        await service['update'](4, {}, {});
      }
      else if (service['create']) {
        await service['create']({}, {});
      }
    }));

    callbacks.forEach(callback => {
      expect(mock[callback].mock.calls.length).toBe(keys.length);
    });
  });

  test('execute services with hooks and invalid callbacks', async() => {
    const callbacks = ['receive', 'validate', 'authorize', 'before', 'respond', 'after', ];
    const mock = {};
    callbacks.forEach(callback => {
      if (callback === 'before' || callback === 'after') {
        mock[callback] = ' ';
      }
      else {
        mock[callback] = jest.fn(x => x);
      }
    });

    expect.assertions(callbacks.length - 2);
    await solos.init(app, undefined, x => mock);

    const services = app.services;
    const keys = Object.keys(services);

    await Promise.all(Object.entries(services).map(async([path, service]) => {
      if (service['remove']) {
        await service['remove'](1);
      }
      else if (service['get']) {
        await service['get'](2);
      }
      else if (service['find']) {
        await service['find']({});
      }
      else if (service['patch']) {
        await service['patch'](3, {}, {});
      }
      else if (service['update']) {
        await service['update'](4, {}, {});
      }
      else if (service['create']) {
        await service['create']({}, {});
      }
    }));

    callbacks.forEach(callback => {
      if (mock[callback] !== ' ') {
        expect(mock[callback].mock.calls.length).toBe(keys.length);
      }
    });
  });

  test('execute services with hooks and invalid callbacks', async() => {

    await solos.init(app);

    const services = app.services;
    expect.assertions(Object.keys(services).length);

    await Promise.all(Object.entries(services).map(async([path, service]) => {
      if (service['remove']) {
        expect(await service['remove'](1)).toHaveProperty('message', 'Solos Lives!!!');
      }
      else if (service['get']) {
        expect(await service['get'](2)).toHaveProperty('message', 'Solos Lives!!!');
      }
      else if (service['find']) {
        expect(await service['find']({})).toHaveProperty('message', 'Solos Lives!!!');
      }
      else if (service['patch']) {
        expect(await service['patch'](3, {}, {})).toHaveProperty('message', 'Solos Lives!!!');
      }
      else if (service['update']) {
        expect(await service['update'](4, {}, {})).toHaveProperty('message', 'Solos Lives!!!');
      }
      else if (service['create']) {
        expect(await service['create']({}, {})).toHaveProperty('message', 'Solos Lives!!!');
      }
    }));
  });
});
