'use strict';

var Product = require('../models/Product')
  , Category = require('../models/Category')
  , specs = require('../helpers/specs')
  ;

function get (req, res, next) {
  Product
    .findOne({ url: req.params.url })
    .populate('category')
    .exec(function (err, product) {
      if (err) return next(err);
      if (product) {
        res.locals.specs = specs[product.url] ? specs[product.url] : null;
        res.locals.imageUrl = product.getImagePath();
        res.locals.product = product;
        res.locals.title = 'Tradohub | Buy ' + product.name + ' of best quality at low prices in India';
        return res.render('products/get',
          { success: req.flash('success'), error: req.flash('error') });
      }
      res.render('404');
    });
};

function list (req, res, next) {
  Category
    .find({})
    .populate('products')
    .sort({'name': 1})
    .exec(function (err, category) {
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