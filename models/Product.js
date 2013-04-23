'use strict';

var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , description: { type: String }
  , url: { type: String }
});

ProductSchema.pre('save', function(next) {
  this.url = this.name.toLowerCase().split(' ').join('-');
  return next();
});

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;