/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect*/


'use strict';

const path = require('path');
const feathers = require('@feathersjs/feathers');
const deified = require('deified');
const solos = require('../solos');
const methods = require('../methods');
const resources = path.join(__dirname, 'resource');
const serviceRegex = /[/](delete|get|patch|post|put).js$/;


describe('Solos should...', () => {
  test('scan for method files and configure services with defaults', async() => {
    const app = feathers();
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };

    await solos.init(app);

    expect.assertions(Object.keys(bindings) + Object.keys(app.services).length);

    Object.entries(app.services).forEach(([path, service]) => {
      expect(path).toEqual(expect.stringMatching(serviceRegex));
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
});

describe('Methods should...', () => {
  test('scan for method files with default configuration', async() => {
    const files = await methods.deify(deified, resources);
    expect.assertions(files.length);

    files.forEach(file => {
      expect(file).toEqual(expect.stringMatching(serviceRegex));
    });
  });

  test('identify matching method files with default configuration', async() => {
    const deify = deified.configure();
    const files = await deify({ directory: resources });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };
    const endpoints = methods.process(files);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach(endpoint => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/]test[/]/));

      Object.keys(bindings).forEach(binding => {
        if (endpoint.service[binding]) {
          bindings[binding]++;
        }
      });
    });

    Object.entries(bindings).forEach(([binding, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });

  test('identify matching method files with configuration', async() => {
    const deify = deified.configure();
    const files = await deify({ directory: resources });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };

    files.base = resources;

    const endpoints = methods.process(files, { skip: 'toskip' }, require);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach(endpoint => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/](alpha|beta)[/]/));

      Object.keys(bindings).forEach(binding => {
        if (endpoint.service[binding]) {
          bindings[binding]++;
        }
      });
    });

    Object.entries(bindings).forEach(([binding, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });
});
