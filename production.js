'use strict';

// set Node environment to production
process.env.NODE_ENV = 'production';

var server = require('./server');

// start server

server.listen();