'use strict';
// db settings using mongoose
var mongoose = require('mongoose')
  , db = mongoose.connection
  , dbPath = require('config').dbPath
  ;

module.exports.connect = function connect(callback){
  mongoose.connect(dbPath, function onMongooseError (err) {
    if (err) {
      console.log ('DB CONNECTION ERROR\n\n' + err);
    }
  });
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function dbCallback() {
    console.log('CONNECTED TO DB: ', db.name);
    if (callback) return callback();
  });
};

module.exports.disconnect = function disconnect(callback){
  mongoose.disconnect();
  console.log('DISCONNECTING DATABASE');
  if (callback) return callback();
};