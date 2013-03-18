// var mongoose = require('mongoose');  

// db settings using mongoose

module.exports = function dbConnect (mongoose, dbPath) {
  mongoose.connect(dbPath, function onMongooseError (err) {
    if (err) {
      console.log ('DB CONNECTION ERROR: ' + err);
    }
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function dbCallback() {
    console.log('CONNECTED TO DB');
  });
  return { db: db }
}