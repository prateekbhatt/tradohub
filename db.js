'use strict';
// db settings using mongoose
var mongoose = require('mongoose')
  , db = mongoose.connection
  , dbPath = require('config').dbPath
  ;

module.exports = function dbConnect () {
  mongoose.connect(dbPath, function onMongooseError (err) {
    if (err) {
      console.log ('DB CONNECTION ERROR\n\n' + err);
    }
  });
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function dbCallback() {
    console.log('CONNECTED TO DB', db.name);
  });
  return db;
}();