'use strict';

// Module dependencies
var express = require('express')  
  , http = require('http')
  , async = require('async')
  , db = require('./db')
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
      db.connect(function(){
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
  
  async.series(
    [
      function (cb){
        server.close();
        cb();
      },

      function (cb){
        process.exit();
        cb();
      }
    ],

    function (err){
      console.log('Server Shut Down');
    }
  );
};