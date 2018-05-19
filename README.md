# SOLOS

  Express.js and Seneca.js based RESTful framework that uses a directory structure to mimic a REST URI,
  and uses filenames for HTTP methods.  All HTTP methods supported by Express are supported.  Solos
  effectively turns Express.js into an extremely opinionated framework.

## Philosophy

  The solos philosophy is that configuration is a great accerlerator to developing RESTful applications and APIs.

## Directory Structure
```
.
├── solos  <-- configurable root directory - see config
│   ├── get.js  <-- GET http://domain.com/
│   ├── alpha
│   │   ├── get.js  <-- GET http://domain.com/alpha/
│   │   └── me  <-- 'me' is a special directory name that signals express parameter loading
│   │       ├── beta
│   │       │   └── me
│   │       │       └── gama
│   │       │           └── put.js  <-- PUT http://domain.com/alpha/:alpha/beta/:beta/gama/
│   │       ├── post.js  <-- POST http://domain.com/alpha/:alpha/
│   │       └── sample
│   │           └── get.js  <-- GET http://domain.com/alpha/:alpha/sample/
│   ├── beta
│   │   └── me
│   │       └── sample
│   │           └── delete.js  <-- DELETE http://domain.com/beta/:beta/sample/
│   └── entities
│       ├── alpha-entity.js  <-- binding into req.solos_context.entities.alpha for /:alpha/
│       └── beta-entity.js  <-- binding into req.solos_context.entities.beta for /:beta/
```
## Setup

```js
const config = require('./config.json'); // load your configuraiton
/*
{
  "resource": {
    "path": "solos" // optional, default to 'solos' 
  },
  "security": {
    "allowAll": true,  // defaults to false, only set to true for testing,
    "groups": {  // define authorization groups where each group is an arry of regular expressions
      "admin": ["^(GET|POST)[^/]+[/]path[/][^ ]+$"],  // each regexp is tested against 'req.method req.path'
      "user": []
    }
  }
}
*/

const express = require('express');
const solos = require('solos');

const app = express();
const router = express.Router();
const seneca = require('seneca')(config);


app.use('/', router);
seneca.use('entity');

// initialize solos
solos.init(router, seneca, config);

// start express
const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Example app listening at http://%s:%s', host === '::' ? 'localhost' : host, port);
});
```
## Usage
### Example http method (get.js)
```js
/*
 * The Lifecycle functions are called in the order they are defined below.
 * All functions are optional except 'respond(msg)'.
 * If the funciton is defined, the parameter 'msg' has req, res, seneca, logger, and express
 * properties which give you access to the http request, http response, seneca, seneca's logger, and
 * the running express instance -and- the function must return an es6 Promise.
 */


/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated <strong>BUT NOT authorized</strong> as this point
 * in the lifecycle!
 */
exports.request_received = function requestReceived(msg) {
  msg.logger.debug('Callback successful', {
    method: 'receive',
  });
  return Promise.resolve(msg);
};

/**
 * Lifecycle function name for validating the user input.
 */
exports.validate = function validate(msg) {
  msg.logger.debug('Callback successful', {
    method: 'validate',
  });
  return Promise.resolve(msg);
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 * Define this only if you want to override the default behavior, which uses regular expressions
 * to authorize the call.
 */
exports.authorize = function authorize(msg) {
  msg.logger.debug('Callback successful', {
    method: 'authorize',
  });
  return Promise.resolve(msg);
};

/**
 * Lifecycle function name for pre-processing the request.
 */
exports.before = function before(msg) {
  msg.logger.debug('Callback successful', {
    method: 'before',
  });
  return Promise.resolve(msg);
};

/**
 * Lifecycle function name for processing the request.
 * This call must send a response to the client.  A response can be sent using any means that
 * express supports including template engines.  If a response is not sent, solos sends a 405 to
 * the client.
 */
exports.respond = function respond(msg) {
  msg.res.send('Solos Lives!!!');
  msg.logger.debug('Callback successful', {
    method: 'respond',
  });
  return Promise.resolve(msg);
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if 'respond' was called.
 */
exports.after = function after(msg) {
  msg.logger.debug('Callback successful', {
    method: 'after',
    context: msg,
  });
  return Promise.resolve(msg);
};

```

## Installation

```bash
$ npm install solos
```

## Features

  * Coming Soon

## Docs & Community

  * Coming Soon

## Examples

  To view an example, clone the solos repo and install the dependencies:

```bash
$ git clone git://github.com/CoderByBlood/solos.git --depth 1
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

[List of all contributors](https://github.com/CoderByBlood/solos/graphs/contributors)

## License

  Copyright (c) 2016 Coder by Blood, Inc;
  Licensed under [MIT](LICENSE)
