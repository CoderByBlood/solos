/*
 * Copyright (c) 2015 by Coder by Blood, Inc. All rights reserved.
 */

'use strict';

const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const solos = require('../main');
const services = feathers();

// This creates an app that is both, an Express and Feathers app
const app = express(services);

// Turn on JSON body parsing for REST services
app.use(express.json());
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

Promise.resolve(solos.init(app)).then(() => {
  // Set up an error handler that gives us nicer errors
  app.use(express.errorHandler());

  const server = app.listen(8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    /* eslint-disable no-console */
    console.log('Example app listening at http://%s:%s', host === '::' ? 'localhost' : host, port);
    /* eslint-enable */
  });
});
