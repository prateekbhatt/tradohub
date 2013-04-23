'use strict';

var mongoose = require('mongoose')
  , knox = require('knox')
  , fs = require('fs')
  , aws = require('../config').aws
  , util = require('util')
  ;

var client = knox.createClient({
    key: aws.key
  , secret: aws.secret
  , bucket: aws.bucket
});

var FileSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , type: { type: String, required: true }
  , created: { type: Date, default: Date.now }
});

function generateName (ext) {
  var name = Date.now().toString()
    , chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    ;
  for (var x = 0; x < 5; x++) {
    var i = Math.floor(Math.random() * 35);
    name += chars.charAt(i);
  }
  name += ext;
  return name;
};

FileSchema.statics.create = function create (file, type, ext, fn) {
  fs.readFile(file, function (err, data) {
    var name = generateName(ext)
      , newPath = type + '/' + name
      ;
    var newFile = new File({ name: name, type: type });
    newFile.save(function (err, saved) {
      client.putFile(file, newPath, function (err, res) {
        if (res.statusCode == 200) {
          console.log('file', file, 'uploaded to s3');
          fs.unlink(file, function (err) {
            if (err) {
              console.log('cannot delete tmp file ', file);
              console.log(err);
            } else {
              console.log('successfully deleted tmp file', file);
            }
          });
          return fn(err, saved);
        } else {
          console.log('failed to upload file', file, 'to s3');
          return fn(new Error('Failed to upload file.'));
        }
      });
    });
  });
};

FileSchema.statics.getUrl = function getUrl (filename, minutes) {
  var name = filename || '/imex/13666430688938A2PA.jpg'
    , expiration = new Date()
    , validity = minutes || 15
    ;
  expiration.setMinutes(expiration.getMinutes() + validity);
  var link = client.signedUrl(filename, expiration);
  console.log(link);
  return link;  
};

var File = mongoose.model('File', FileSchema);

module.exports = File;