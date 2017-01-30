/*
 * (c) 2015 by Three Pawns, Inc.
 */

'use strict';

const express = require('express');
const config = require('../config.json');
const solos = require('../solos.js');

const app = express();
const router = express.Router();
const seneca = require('seneca')(config);


app.use('/', router);
seneca.use('entity');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

solos.init(router, seneca, config);

const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  /* eslint-disable no-console */
  console.log('Example app listening at http://%s:%s', host === '::' ? 'localhost' : host, port);
  /* eslint-enable */
});
