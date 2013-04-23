// var mongoose = require('mongoose');  

// db settings using mongoose

module.exports = function dbConnect (dbPath) {
  var mongoose = require('mongoose')
    , db = mongoose.connection
    ;
  mongoose.connect(dbPath, function onMongooseError (err) {
    if (err) {
      console.log ('DB CONNECTION ERROR: ' + err);
    }
  });
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function dbCallback() {
    console.log('CONNECTED TO DB');
  });
  return db;
}