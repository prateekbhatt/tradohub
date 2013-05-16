'use strict';

var mongoose = require('mongoose')
  , timestamps = require('mongoose-timestamp')
  , knox = require('knox')
  , fs = require('fs')
  , aws = require('../config').aws
  , util = require('util')
  , fileValidate = require('../helpers/fileValidate')
  ;

var client = knox.createClient({
    key: aws.key
  , secret: aws.secret
  , bucket: aws.bucket
});

var FileSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , type: { type: String, required: true }
});

FileSchema.plugin(timestamps);

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

function getPath (name, type) {
  var path = type + '/' + name;
  return path;
};

FileSchema.statics.create = function create (file, type, permission, fn) {

  // check if file is valid, if it is valid return the extension of the file
  var ext = fileValidate(file.name)
    , path = file.path
    , headers = (permission == 'public') ? { 'x-amz-acl': 'public-read' } : null
    ;

  if (ext) {

    var name = generateName(ext)
      , newPath = getPath(name, type)
      ;

    // upload file to s3
    client.putFile(path, newPath, headers, function (err, res) {
      if (res.statusCode == 200) {
        
        console.log('file', path, 'uploaded to s3');
        
        // delete tmp file
        fs.unlink(path, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('successfully deleted tmp file');
          }
        });

        // add file to files collection in db
        var newFile = new File({ name: name, type: type });
        newFile.save(function (err, saved) {
          return fn(err, saved);
        });

      } else {
        console.log('failed to upload file', path, 'to s3');
        return fn(new Error('Failed to upload file.'));
      }

    });
    
  } else {
    return fn(new Error('Not a valid file.'));
  }
};

FileSchema.statics.remove = function remove (id, fn) {
  File.findById(id, function (err, f) {
    var path = getPath(f.name, f.type);
    client.deleteFile(path, function (err, res) {
      console.log('inside delete file')
      console.log(res)
      if (!err) {
        File.findByIdAndRemove(f._id, function (err, deleted) {
          return fn(err, deleted);
        });
      }
    });    
  });
};

FileSchema.statics.update = function update (id, file, permission, fn) {
  File.findById(id, function (err, f) {
    var valid = fileValidate(file.name)
      , awsPath = getPath(f.name, f.type)
      , headers = (permission == 'public') ? { 'x-amz-acl': 'public-read' } : null
      ;

    // TODO: allow updating to file with a different extension
    if (valid) {
      // delete old file
      client.deleteFile(awsPath, function (err, res) {
        console.log('inside update file')
        console.log(res.statusCode)
        if (!err) {
          var path = file.path;
          // upload new file
          client.putFile(path, awsPath, headers, function (err, res) {
            if (res.statusCode == 200) {
            
              console.log('file', path, 'uploaded to s3');
              
              // delete tmp file
              fs.unlink(path, function (err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('successfully deleted tmp file');
                }
              });

              return fn(null, true);

            } else {
              console.log('failed to upload file', path, 'to s3');
              return fn(new Error('Failed to upload new file.'));
            }
          })        
        }
      });  
    } else {
      return fn(new Error('Provide a valid file.'));
    }

  });
};

FileSchema.methods.getPath = function () {
  var path = '/' + this.type + '/' + this.name;
  return path
};

FileSchema.methods.getFullPath = function () {
  var path = 'https://s3.amazonaws.com/' + aws.bucket + this.getPath();
  return path;
};

FileSchema.methods.getUrl = function (minutes) {
  var path = this.getPath() // || '/imex/13666430688938A2PA.jpg'
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