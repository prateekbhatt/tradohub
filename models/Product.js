'use strict';

var Product =  function(){

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , troop = require('mongoose-troop')
    , config = require('config')
    , knox = require('knox')
    , fileValidate = require('../helpers/fileValidate')
    , validateFile = require('../helpers/validateFile')
    , fs = require('fs')
    , slugify = require('../helpers/slugify')
    , async = require('async')
    ;

  // create fileclient to upload and remove product images to aws s3
  var client = knox.createClient({
      key: config.aws.key
    , secret: config.aws.secret
    , bucket: config.aws.bucket
  });

  var ProductSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true }
    , description: { type: String }
    , url: { type: String }
    , category: { type: Schema.Types.ObjectId, ref: 'Category' }
    , image: { type: String }
  });

  // adds created and updated timestamps to the document
  ProductSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

  ProductSchema.pre('save', function(next) {
    this.url = slugify(this.name);
    return next();
  });

  ProductSchema.methods.getImagePath = function () {
    var imagePath = 'https://s3.amazonaws.com/' + bucket + '/static/img/products/' + this.image;
    return imagePath;
  };

  ProductSchema.methods.updateImagePath = function (imagePath, fn) {
    // add imagePath to product image property
    this.image = imagePath;
    this.save(function(err, saved){
      return fn(err, saved);
    });
  };

  ProductSchema.statics.uploadImage = function (pid, file, fn) {
    var fileExt
      , product
      , imagePath
      , savedImage
      , awsPath = 'static/img/products/' + imagePath
      , headers = { 'x-amz-acl': 'public-read' }
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
          imagePath = product.url + validExt;
          callback();
        });
      },
      // delete image file if exists
      function (callback){
        if (product.image){
          var oldImage = 'static/img/products/' + product.image;

          client.deleteFile(oldImage, function (err, res) {
            console.log('\ndeleted old image file', res.statusCode);
            callback();
          });
        } else {
          callback();
        }
      },
      // upload new image file to s3
      function (callback){
        client.putFile(file.path, awsPath, headers, function (err, res){
          if (err) return callback(err);
          if (res.statusCode == 200){
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

  ProductSchema.statics.updateImage = function (pid, file, fn) {
    Product.findById(pid, function (err, product) {
      var validExt = fileValidate(file.name)
        , imagePath = product.url + validExt
        , awsPath = 'static/img/products/' + imagePath
        , headers = { 'x-amz-acl': 'public-read' }
        ;
      
      if (!validExt) {
        return fn(new Error('Please upload a valid image type. Only jpg/jpef format allowed.'))
      }
      // upload new image file
      client.putFile(file.path, awsPath, headers, function (err, res) {

        console.log('\n\ninside Product put file')
        console.log(err)
        console.log(file.path, awsPath)
        // console.log(res)

        if (res.statusCode == 200) {
          
          console.log('\nfile', awsPath, 'uploaded to s3');
          // if product already has an image, delete that image
          if (product.image != imagePath) {
            var oldImage = 'static/img/products/' + product.image;

            client.deleteFile(oldImage, function (err, res) {
              console.log('\ndeleted old image file', res.statusCode)
            });
          }

          product.updateImagePath(imagePath, function (err, saved) {
            return fn(err, saved);
          });

        } else {
          console.log('failed to upload file', imagePath, 'to s3');
          return fn(new Error('Failed to upload file.'));
        }

      });
    });
  };

  var _model = mongoose.model('Product', ProductSchema);
  return _model;
  
}();

module.exports = Product;