'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var ProductSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , description: { type: String }
  , url: { type: String }
  , category: { type: Schema.Types.ObjectId, ref: 'Category' }
  , image: { type: Schema.Types.ObjectId, ref: 'File' }
});

ProductSchema.pre('save', function(next) {
  this.url = this.name.toLowerCase().split(' ').join('-');
  return next();
});

ProductSchema.methods.updateImage = function updateImage (fid, fn) {
  this.image = fid;
  this.save(function (err, updated) {
    fn(err, updated);
  });
};

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;