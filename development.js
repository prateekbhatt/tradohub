'use strict';

// Module dependencies
var express = require('express')  
  , http = require('http')
  ;

// set Node environment
process.env.NODE_ENV = 'development';

// Create app
var app = express();

console.log('\n\nNode Environment: ', process.env.NODE_ENV);

// connect to database
require('./db')
// import express configurations
require('./middleware')(app);
// import application routes
require('./app_routes')(app);

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port", app.get('port'));
});