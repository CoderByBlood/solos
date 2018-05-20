/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect*/

'use strict';

const path = require('path');
const deified = require('deified');
const services = require('../services');
const resources = path.join(__dirname, 'api');
const deifiedConfig = {
  glob: {
    globs: ['**/*.solos.js'],
  },
};


describe('Methods should...', () => {
  test('scan for method files with default configuration', async() => {
    const files = await services.deify(deified, resources);
    expect.assertions(files.length);

    files.forEach(file => {
      expect(file).toEqual(expect.stringMatching(/[.]solos[.]js$/));
    });
  });

  test('identify matching method files with default configuration', async() => {
    const deify = deified.configure(deifiedConfig);
    const files = await deify({ directory: resources });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };
    const endpoints = services.process(files);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach(endpoint => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/]test[/]/));

      Object.keys(bindings).forEach(binding => {
        if (endpoint.solos[binding]) {
          bindings[binding]++;
        }
      });
    });

    Object.entries(bindings).forEach(([binding, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });

  test('identify matching method files with configuration', async() => {
    const deify = deified.configure(deifiedConfig);
    const files = await deify({ directory: resources });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };

    files.base = resources;

    const endpoints = services.process(files, { skip: 'toskip' }, require);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach(endpoint => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/](alpha|beta)[/]?/));

      Object.keys(bindings).forEach(binding => {
        if (endpoint.solos[binding]) {
          bindings[binding]++;
        }
      });
    });

    Object.entries(bindings).forEach(([binding, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });
});
