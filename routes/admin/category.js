'use strict';

var Category = require('../../models/Category')
  , Product = require('../../models/Product')
  ;

function get (req, res, next) {
  Category.findOne({ url: req.params.url }, function (err, category) {
    if (err) return next(err);
    if (category) {
      Product.find({ cid: category._id }, function (err, p) {
        console.log('\n\n Inside category get route \n\n');
        if (err) return next(err);
        res.locals.category = category;
        res.locals.products = p;
        return res.render('admin/category',
          { success: req.flash('success'), error: req.flash('error') });
      });
    } else {
      res.render('404');      
    }
  });
};

function list (req, res, next) {
  Category.find({}, function (err, category) {
    if (err) return next(err);
    res.locals.category = category;
    res.render('admin/categories',
      { success: req.flash('success'), error: req.flash('error') });
  });
};

function create (req, res, next) {
  var category = {
      name: req.body.name
    , description: req.body.description
  };
  Category.create(category, function (err, saved) {
    if (err) return next(err);
    if (saved) {
      return res.redirect('/admin/category');
    }
    res.redirect('/admin/category');
  });
};

function update (req, res, next) {
  Category.findById(req.params.id, function (err, c) {
    if (err) return next(err);
    c.name = req.body.name;
    c.description = req.body.description;
    c.save(function (err, saved) {
      if (err) return next(err);
      if (saved) {
        res.redirect('/admin/category');
      }
    });
  });
};

module.exports = {
    get: get
  , list: list
  , create: create
  , update: update
};