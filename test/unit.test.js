/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

/*global expect*/


'use strict';

const path = require('path');
const deified = require('deified');
const methods = require('../methods');

const resources = path.join(__dirname, 'resource');

describe('Methods should...', () => {
  test('scan for method files with default configuration', async() => {
    const files = await methods.deify(deified, resources);
    expect.assertions(files.length);

    files.forEach(file => {
      expect(file).toEqual(expect.stringMatching(/[/](delete|get|patch|post|put).js$/));
    });
  });

  test('identify matching method files with default configuration', async() => {
    const deify = deified.configure();
    const files = await deify({ directory: resources });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };
    const endpoints = methods.process(files);

    expect.assertions(6 + endpoints.length);

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

    expect.assertions(6 + endpoints.length);

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
