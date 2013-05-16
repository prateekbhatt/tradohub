'use strict';

var Product = require('../models/Product')
  , Category = require('../models/Category')
  ;

function get (req, res, next) {
  Product.findOne({ url: req.params.url }).populate('category').populate('image').exec(function (err, product) {
    if (err) return next(err);
    console.log(product)
    if (product) {
      res.locals.imageUrl = product.image ? product.image.getFullPath() : null;
      res.locals.product = product;
      return res.render('products/get',
        { success: req.flash('success'), error: req.flash('error') });
    }
    res.render('404');
  });
};

function list (req, res, next) {
  Category.find({}).populate('products').sort({'name': 1}).exec(function (err, category) {
    if (err) return next(err);
    res.locals.category = category;
    res.render('products/list',
      { success: req.flash('success'), error: req.flash('error') });
  });
};

function offers (req, res, next) {
  res.render('products/offers',
    { success: req.flash('success'), error: req.flash('error') });
};

module.exports = {
    get: get
  , list: list
  , offers: offers
};