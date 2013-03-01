// var mongoose = require('mongoose');  

// db settings using mongoose

// mongoose.connect('localhost', 'amdavad');
// var db = module.exports = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function callback() {
//   console.log('Connected to DB');
// });

module.exports = function db_connect (mongoose, dbPath) {
  mongoose.connect(dbPath, function onMongooseError (err) {
    if (err) {
      console.log ('DB CONNECTION ERROR: ' + err);
    }
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function db_callback() {
    console.log('CONNECTED TO DB');
  });
  return { db: db }
}