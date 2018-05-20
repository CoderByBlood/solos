# SOLOS

  Solos opinionates [Express](http://expressjs.com/) and
  [Feathers](https://feathersjs.com/) to accerate development of RESTful
  services.

## Philosophy

  The solos philosophy is that convention (over configuration) is the best
  accerlerator to developing applications and APIs.

## Directory Structure
```
.
├── api  <-- configurable root directory - see config
│   ├── alpha.solos.js  <-- (DELETE|GET|PATCH|POST|PUT) http://domain.com/api/alpha
│   ├── alpha
│   │   ├── beta.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/beta
│   │   └── me  <-- 'me' is a special directory name that signals route parameters
│   │       ├── beta
│   │       │   └── me
│   │       │       └── gama.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/:alphaId/beta/:betaId/gama
│   │       └── delta.solos.js  <-- (DELETE...PUT) http://domain.com/api/alpha/:alphaId/delta
```

## Setup

```js
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const solos = require('solos');
const services = feathers();
const config = {};

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

Promise.resolve(solos.init(app, config)).then(() => {
  // Set up an error handler that gives us nicer errors
  app.use(express.errorHandler());

  const server = app.listen(8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Example app listening at http://%s:%s', host === '::' ? 'localhost' : host, port);
  });
});

```
## Usage
  Solos modules must export at least one service method as defined by
  Feathersjs (See [Service documentation](https://docs.feathersjs.com/api/services.html)):
  - `remove(...)`
  - `get(...)`
  - `find(...)`
  - `patch(...)`
  - `create(...)`
  - `update(...)`

  Solos modules may also export hooks that are called as part of the
  request lifecycle:
  1. `receive(context)` The beginning of the request lifecycle
  2. `validate(context)` Validate input and parameters
  3. `authorize(context)` Ensure the requester can perform the action
  4. `before(context)` Last chance before request is serviced
  5. `after(context)` After request is serviced and the end of the lifecycle

  Lifecycle hooks may also have a 'service method name' suffix to scope the
  hook to only that service method.  Using a module that exports
  `get(id, params)` and `find(params)` serivce methods as an example:
  - `receive(context)` called for both `get` and `find` service requests
  - `receive_get(context)` called for only `get` service requests
  - `receive_find(context)` called for only `find` serivce requests

  Exported functions are called in the following order:
  1. `receive(context)`
  2. `receive_[remove|get|find|patch|create|update](context)`
  3. `validate(context)`
  4. `validate_[remove|get|find|patch|create|update](context)`
  5. `authorize(context)`
  6. `authorize_[remove|get|find|patch|create|update](context)`
  7. `before(context)`
  8. `before_[remove|get|find|patch|create|update](context)`
  9. `[remove|get|find|patch|create|update](...)`
  10. `after(context)`
  11. `after_[remove|get|find|patch|create|update](context)`

  The 'context' parameter has properties documented by Feathersjs
  (see [Hook documentation](https://docs.feathersjs.com/api/hooks.html)).
  It has an addtional `log` property.  `log.debug()` for general debugging
  and `log.trace()` for detailed tracing - both are from the debug module.


  The mapping between HTTP Methods and service methods are defined by Featherjs
  (see [REST documentation](https://docs.feathersjs.com/guides/basics/rest.html)).

### Example solos service (endpoint.solos.js)
```js
'use strict';

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated **BUT NOT authorized** as this point
 * in the lifecycle.  This is called for every service method.
 */
exports.receive = async function receive(context) {
  context.log.debug('Callback successful', {
    method: 'receive',
  });
  return context;
};

/**
 * Lifecycle function name that indicates a request to execute the method has been received.
 * The request has been authenticated **BUT NOT authorized** as this point
 * in the lifecycle.
 */
exports.receive_find = async function receive_find(context) {
  context.log.debug('Callback successful', {
    method: 'receive_find',
  });
  return context;
};

/**
 * Lifecycle function name for validating the user input.
 * This is called for every service method.
 */
exports.validate = async function validate(context) {
  context.log.debug('Callback successful', {
    method: 'validate',
  });
  return context;
};

/**
 * Lifecycle function name for validating the user input.
 */
exports.validate_find = async function validate_find(context) {
  context.log.debug('Callback successful', {
    method: 'validate_find',
  });
  return context;
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 * This is called for every service method.
 */
exports.authorize = async function authorize(context) {
  context.log.debug('Callback successful', {
    method: 'authorize',
  });
  return context;
};

/**
 * Lifecycle function name for authorizing the user to endpoint.
 */
exports.authorize_find = async function authorize_find(context) {
  context.log.debug('Callback successful', {
    method: 'authorize_find',
  });
  return context;
};

/**
 * Lifecycle function name for pre-processing the request.
 * This is called for every service method.
 */
exports.before = async function before(context) {
  context.log.debug('Callback successful', {
    method: 'before',
  });
  return context;
};

/**
 * Lifecycle function name for pre-processing the request.
 */
exports.before_find = async function before_find(context) {
  context.log.debug('Callback successful', {
    method: 'before_find',
  });
  return context;
};

/**
 * Function name for processing the request.
 * JSON returned from this call is sent to the client.
 */
exports.find = async function find(params, log) {
  log.debug('Callback successful', {
    method: 'find',
  });
  return { params };
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if the serivce method was called.
 * This is called for every service method.
 */
exports.after = async function after(context) {
  context.log.debug('Callback successful', {
    method: 'after',
  });
  return context;
};

/**
 * Lifecycle function name for post-processing and cleanup.
 * This is only called if the service method was called.
 */
exports.after_find = async function after_find(context) {
  context.log.debug('Callback successful', {
    method: 'after_find',
  });
  return context;
};
```
## Configuration ##

  Solos configuration opject for `solos.init(app, config)` can have
  the following properties:
  - `directory: '...')` - the full path to the directory to scan
    for solos files, defaults to current working directory
  - `deified: {...}` - the configuration passed to deified module - see
    its docs:
    - `glob: {globs: ['**`&#8205;`/*.solos.js'], }` the default is all solos.js
       files in subdirectories
  - `hooks:{...}` has two properties `before` and `after`
    - `before: ['receive', 'validate', 'authorize', 'before', ]` the
       callback **before** hooks, in the order called
    - `after: ['after', ]` the callback **after** hooks, in the
       order called

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
$ npm start
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
