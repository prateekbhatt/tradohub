'use strict';

var User = require('../models/User')
  , Txn = require('../models/Txn')
  , Product = require('../models/Product')
  ;

function listProducts (req, res, next) {
  Product.find({}, function (err, products) {
    if (err) return next(err);
    if (products) {
      return res.format({
        html: function(){
          res.locals.products = products;
          res.render('partials/admin/products');
        },
        json: function(){ res.json(200, products); }
      });
    }
    res.format({
      html: function(){
        res.locals.products = null;
        res.render('partials/admin/products');
      },
      json: function(){ res.json(400, { error: { message: 'No Product Found'}}); }
    });
  });
};

function getProduct (req, res, next) {
  Product.findOne({ url: req.params.url }, function (err, product) {
    if (err) return next(err);
    if (product) {
      return res.format({
        html: function(){
          res.locals.product = product;
          res.render('partials/admin/product');
        },
        json: function(){ res.json(200, product); }
      });
    }
    res.format({
      html: function(){ res.render('404'); },
      json: function(){ res.json(404, { error: { message: 'Product Not Found' }}); }
    });
  });
};

module.exports = {
    getProduct: getProduct
  , listProducts: listProducts
}