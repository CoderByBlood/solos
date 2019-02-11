/* eslint-disable no-undef */
/*
 * Copyright (c) 2018 by Coder by Blood, Inc. All rights reserved.
 */

// eslint-disable-next-line spaced-comment
/*global expect*/

'use strict';

const path = require('path');
const services = require('../services');
const globby = require('globby');

const resources = path.join(__dirname, 'api');
const globConfig = {
  globs: ['**/*.solos.js'],
};


describe('Methods should...', () => {
  test('scan for method files with default configuration', async () => {
    const files = await services.glob(resources);
    expect.assertions(files.length);

    files.forEach((file) => {
      expect(file).toEqual(expect.stringMatching(/[.]solos[.]js$/));
    });
  });

  test('identify matching method files with default configuration', async () => {
    const files = await globby(globConfig.globs, { cwd: resources, absolute: true });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };
    const endpoints = services.process(files);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach((endpoint) => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/]test[/]/));

      Object.keys(bindings).forEach((binding) => {
        if (endpoint.solos[binding]) {
          bindings[binding] += 1;
        }
      });
    });

    Object.entries(bindings).forEach(([, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });

  test('identify matching method files with configuration', async () => {
    const files = await globby(globConfig.globs, { cwd: resources, absolute: true });
    const bindings = { remove: 0, get: 0, find: 0, patch: 0, create: 0, update: 0 };

    files.base = resources;

    const endpoints = services.process(files, { skip: 'toskip' }, require);

    expect.assertions(Object.keys(bindings) + endpoints.length);

    endpoints.forEach((endpoint) => {
      expect(endpoint.path).toEqual(expect.stringMatching(/^[/](alpha|beta)[/]?/));

      Object.keys(bindings).forEach((binding) => {
        if (endpoint.solos[binding]) {
          bindings[binding] += 1;
        }
      });
    });

    Object.entries(bindings).forEach(([, count]) => {
      expect(count).toBeGreaterThan(0);
    });
  });
});
