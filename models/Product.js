'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , troop = require('mongoose-troop')
  ;

var ProductSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , description: { type: String }
  , url: { type: String }
  , category: { type: Schema.Types.ObjectId, ref: 'Category' }
  , image: { type: Schema.Types.ObjectId, ref: 'File' }
});

// adds created and updated timestamps to the document
ProductSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

ProductSchema.pre('save', function(next) {
  this.url = this.name.toLowerCase().split(' ').join('-');
  return next();
});

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;