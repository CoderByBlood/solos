# RAPID SOLOS

  Express.js based RESTful framework

```js
const config = require('./config.json'); // load your configuraiton

const express = require('express');
const solos = require('rapid-solos');

const app = express();
const router = express.Router();
const seneca = require('seneca')(config);


app.use('/', router);
seneca.use('entity');

// If you want to change how files are required
seneca.add({
  role: 'solos',
  cmd: 'require',
}, (msg, respond) => {
  let error;

  try {
    msg.module = require(`./${msg.path}`); // change string passed to require()
  } catch (err) {
    error = err;
  }

  respond(error, msg);
});

// initialize solos
solos.init(router, seneca, config);

// start express
const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Example app listening at http://%s:%s', host === '::' ? 'localhost' : host, port);
});
```

## Installation

```bash
$ npm install seneca
$ npm install rapid-solos
```

## Features

  * Coming Soon

## Docs & Community

  * Coming Soon

## Philosophy

  The solos philosophy is that configuration is great accerlerator to developing RESTful applications.

## Examples

  To view an example, clone the solos repo and install the dependencies:

```bash
$ git clone git://github.com/BrilliancySoftware/solos.git --depth 1
$ cd solos
$ npm install
```

  Then run the example:

```bash
$ node test/express.js
```

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## People

[List of all contributors](https://github.com/BrilliancySoftware/solos/graphs/contributors)

## License

  Copyright (c) 2016 Three Pawns, Inc;
  Licensed under [MIT](LICENSE)
