'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , troop = require('mongoose-troop')
  , config = require('config')
  , knox = require('knox')
  , fileValidate = require('../helpers/fileValidate')
  , fs = require('fs')
  , bucket = config.aws.prodBucket // image files always updated on production bucket
  , slugify = require('../helpers/slugify')
  ;

// create fileclient to upload and remove product images to aws s3
var client = knox.createClient({
    key: config.aws.key
  , secret: config.aws.secret
  , bucket: bucket
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

        // add imagePath to product image property
        product.image = imagePath;
        product.save(function (err, saved) {
          return fn(err, saved);
        });

      } else {
        console.log('failed to upload file', imagePath, 'to s3');
        return fn(new Error('Failed to upload file.'));
      }

    });
  });
};

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;