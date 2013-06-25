'use strict';

// Module dependencies
var express = require('express')  
  , http = require('http')
  , async = require('async')
  ;

// Create app
var app = express();

// import express configurations
require('./app_middleware')(app);

// import application routes
require('./app_routes')(app);

// server

var server = http.createServer(app);

module.exports.listen = function (callback) {

  console.log('\nNODE ENVIRONMENT: ', process.env.NODE_ENV);

  async.series([
    
    // connect to database
    function(cb){
      require('./db')(function(){
        cb(null);
      });      
    },

    // listen to server
    function(cb){
      server.listen(app.get('port'), function(){
        console.log("\nServer listening on port", app.get('port'));
        cb(null);
      });      
    }

  ],

  function(err, result){
    if (callback) callback();
  });

};

module.exports.close = function () {

  console.log('SHUTTING DOWN SERVER');
  
  async.series([
    server.close(),
    process.exit()    
  ]);
};