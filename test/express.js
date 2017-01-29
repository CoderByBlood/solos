/*
 * (c) 2015 by Three Pawns, Inc.
 *
 * All rights reserved. No part of this document may be reproduced, distributed,
 * or transmitted in any form or by any means, including photocopying, recording,
 * or other electronic or mechanical methods, without the prior written permission
 * of Three Pawns, Inc.
 */
"use strict";

const express = require("express");
const config = require("../config.json");
const solos = require("../solos.js");

const app = express();
const router = express.Router();
const seneca = require('seneca')(config);


app.use("/", router);
seneca.use('entity');

app.get('/', function (req, res) {
    res.send('Hello World!');
});

solos.init(router, seneca, config);

const server = app.listen(3000, function () {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Example app listening at http://%s:%s', host === "::" ? "localhost" : host, port);
});
