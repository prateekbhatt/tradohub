'use strict';

var Category = function(){

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , troop = require('mongoose-troop')
    ;

  var CategorySchema = new Schema({
      name: { type: String, required: true, unique: true }
    , description: { type: String }
    , url: { type: String, unique: true }
    , products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  });

  // adds created and updated timestamps to the document
  CategorySchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

  CategorySchema.pre('save', function(next) {
    this.url = this.name.toLowerCase().split(' ').join('-');
    return next();
  });

  CategorySchema.statics.removeProduct = function (categoryId, productId, fn) {
    Category.findById(categoryId, function (err, c) {
      if (err) return fn(err);
      if (c) {
        var p = c.products
          , index = p.indexOf(productId)
          ;
        p.splice(index, 1);
        c.save(function (err, s) {
          if (err) return fn(err);
          if (!err) {
            return fn(null, true);          
          }
        });
      }
    });
  };

  CategorySchema.statics.addProduct = function (categoryId, productId, fn) {
    Category.findById(categoryId, function (err, c) {
      if (err) return fn(err);
      c.products.push(productId);
      c.save(function (err, saved) {
        if (err) return fn(err);
        if (saved) {
          return fn(null, true);
        }
      });
    });
  };

  var _model = mongoose.model('Category', CategorySchema);
  
  return _model;
  
}();


module.exports = Category;