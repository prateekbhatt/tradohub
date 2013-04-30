'use strict';

var Product = require('../models/Product');

function get (req, res, next) {
  Product.findOne({ url: req.params.url }, function (err, product) {
    if (err) return next(err);
    console.log(product)
    if (product) {
      return res.format({
        html: function(){
          res.locals.product = product;
          res.render('partials/product');
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

function list (req, res, next) {
  Product.find({}, function (err, products) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.products = products;
        res.render('partials/products');
      },
      json: function(){ res.json(200, products); }
    });
  });
};

module.exports = {
    get: get
  , list: list
};