# RAPID SOLOS

  Express.js and Seneca.js based RESTful framework that uses a directory structure to mimic a REST URI,
  and uses filenames for HTTP methods.  All HTTP methods supported by Express are supported.

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
    "path": "solos" // default to '.' 
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
const solos = require('rapid-solos');

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
 * All functions are optional except 'respond(msg, done)'.
 * If defined, the first parameter 'msg' has req, res properties which give you access to the
 * http request and http response -and- the second parameter 'done' is the callback that
 * has the standard callback(error, result) signature.
 */


/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated <strong>BUT NOT authorized</strong> as this point
 * in the lifecycle!
 */
exports.request_received = function requestReceived(msg, done) {
  msg.logger.debug('Callback successful', {
    method: 'receive',
  });
  done(undefined, msg);
};

/**
 * Lifecycle function name for validating the user input.
 */
exports.validate = function validate(msg, done) {
  msg.logger.debug('Callback successful', {
    method: 'validate',
  });
  done(undefined, msg);
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 * Define this only if you want to override the default behavior, which uses regular expressions
 * to authorize the call.
 */
exports.authorize = function authorize(msg, done) {
  msg.logger.debug('Callback successful', {
    method: 'authorize',
  });
  done(undefined, msg);
};

/**
 * Lifecycle function name for pre-processing the request.
 */
exports.before = function before(msg, done) {
  msg.logger.debug('Callback successful', {
    method: 'before',
  });
  done(undefined, msg);
};

/**
 * Lifecycle function name for processing the request.
 * This call must send a response to the client.  A response can be sent using any means that
 * express supports including template engines.  If a response is not sent, solos sends a 405 to
 * the client.
 */
exports.respond = function respond(msg, done) {
  msg.res.send('Solos Lives!!!');
  msg.logger.debug('Callback successful', {
    method: 'respond',
  });
  done(undefined, msg);
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if 'respond' was called.
 */
exports.after = function after(msg, done) {
  msg.logger.debug('Callback successful', {
    method: 'after',
    context: msg,
  });
  done(undefined, msg);
};
```
### Example entity.js (alpha-entity.js)
```js
/**
 * This is called as the parameter is bound into express at load time.
 * 'seneca.make(param).load$(id, (err, found) => { ... });' is called by solos at runtime.
 *
 * Seneca can be accessed through 'options.seneca' and param can be accessed
 * through 'options.param'.
 * The callback has the standrard callback(error, result) signature.  However, only
 * the error parameter in the callback is inspected.
 */
exports.bind = function bind(options, callback) {
  // write any initialization code here
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
