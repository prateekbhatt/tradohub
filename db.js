var mongoose = require('mongoose');  

// db settings using mongoose

mongoose.connect('localhost', 'amdavad');
var db = module.exports = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});