/**
 * Copyright (c) 2016, Three Pawns, Inc. All rights reserved.
 */

'use strict';

module.exports = function assemble(/* unused options parameter */) {
  const seneca = this;

  this.add({
    role: 'solos',
    cmd: 'assemble',
  }, (msg, respond) => {
    seneca.act({
      role: 'solos',
      cmd: 'scan',
    }, respond);
  });
};
