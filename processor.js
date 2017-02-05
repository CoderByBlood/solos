/**
 * Copyright (c) 2016, Three Pawns, Inc. All rights reserved.
 */

'use strict';

module.exports = function process(/* unused options parameter */) {
  const seneca = this;

  this.add({
    role: 'solos',
    cmd: 'require',
  }, (msg, respond) => {
    this.prior(msg, (err, out) => {
      let error = err;
      msg.module = out ? out.module : null;

      if (!error && !msg.module) {
        try {
          /* eslint-disable global-require, import/no-dynamic-require */
          msg.module = require(`./${msg.path}`);
          /* eslint-enable */
        } catch (erred) {
          error = erred;
        }
      }

      respond(error, msg);
    });
  });

  this.add({
    role: 'solos',
    cmd: 'process',
    target: 'entity',
  }, (msg, respond) => {
    seneca.act({
      role: 'solos',
      cmd: 'require',
    }, msg, (err, message) => {
      if (err) {
        respond(err, message);
      } else {
        seneca.act({
          role: 'solos',
          cmd: 'bind',
        }, message, respond);
      }
    });
  });

  this.add({
    role: 'solos',
    cmd: 'process',
    target: 'method',
  }, (msg, respond) => {
    seneca.act({
      role: 'solos',
      cmd: 'require',
    }, msg, (err, message) => {
      if (err) {
        respond(err, message);
      } else {
        seneca.act({
          role: 'solos',
          cmd: 'bind',
        }, message, respond);
      }
    });
  });
};
