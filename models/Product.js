'use strict';

var Product =  function(){

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , troop = require('mongoose-troop')
    , aws = require('config').aws
    , knox = require('knox')
    , fileValidate = require('../helpers/fileValidate')
    , validateFile = require('../helpers/validateFile')
    , fs = require('fs')
    , slugify = require('../helpers/slugify')
    , async = require('async')
    ;

  // create fileclient to upload and remove product images to aws s3
  var client = knox.createClient({
      key: aws.key
    , secret: aws.secret
    , bucket: aws.bucket
  });

  var ProductSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true }
    , description: { type: String }
    , url: { type: String }
    , category: { type: Schema.Types.ObjectId, ref: 'Category' }
    , image: { type: String, default: null }
  });

  // adds created and updated timestamps to the document
  ProductSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

  ProductSchema.pre('save', function(next) {
    this.url = slugify(this.name);
    return next();
  });

  ProductSchema.methods.getImagePath = function () {
    if (this.image){
      var imagePath = 'https://s3.amazonaws.com/' + aws.bucket + '/static/img/products/' + this.image;
      return imagePath;
    } else {
      return null;
    }
  };

  ProductSchema.methods.updateImagePath = function (imagePath, fn) {
    // add imagePath to product image property
    if (imagePath){
      this.image = imagePath;
      this.save(function(err, saved){
        return fn(err, saved);
      });      
    } else {
      fn(new Error('Invalid Image Path provided'));
    }
  };

  ProductSchema.methods.deleteImage = function (fn){
    if (this.image){
      var imagePath = 'static/img/products/' + this.image;

      client.deleteFile(imagePath, function (err, res) {
        console.log('\ndeleted product image file:', imagePath, res.statusCode);
        fn();
      });
    } else {
      fn();
    }
  };

  ProductSchema.statics.updateImage = function (pid, file, fn) {
    var fileExt
      , product
      , imagePath
      , savedImage      
      ;

    async.series([
      // validate file and get extension
      function (callback){
        validateFile(file.name, function (err, ext){
          if (err) return callback(err);
          fileExt = ext;
          callback();
        })
      },
      // get product and set imagePath
      function (callback){
        Product.findById(pid, function (err, pro){
          if (err) return callback (err);
          product = pro;
          imagePath = product.url + fileExt;
          callback();
        });
      },
      // delete image file if exists
      function (callback){
        product.deleteImage(callback);
      },
      // upload new image file to s3
      function (callback){
        
        var awsPath = 'static/img/products/' + imagePath
          , headers = { 'x-amz-acl': 'public-read' }
          ;

        client.putFile(file.path, awsPath, headers, function (err, res){
          if (err) return callback(err);
          if (res.statusCode == 200){
            console.log('uploaded new image', awsPath)
            callback();
          }
        })
      },
      // update image path in product table
      function (callback){
        product.updateImagePath(imagePath, function (err, saved) {
          if (err) return callback(err);
          savedImage = saved;
          callback();
        });
      }
    ],

    function (err, result){
      if (err) return fn(err, null);
      fn(err, savedImage);
    })
  };

  var _model = mongoose.model('Product', ProductSchema);
  return _model;
  
}();

module.exports = Product;