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

function create (req, res, next) {
  var product = {
      name: req.body.name
    , description: req.body.description
  };
  Product.create(product, function (err, saved) {
    if (err) return next(err);
    if (saved) {
      return res.format({
        html: function(){ res.redirect('/admin/products'); },
        json: function(){ res.json(200, { success: { message: 'Product saved' }}); }
      });
    }
    res.format({
      html: function(){ res.redirect('/admin/products'); },
      json: function(){ res.json(400, { error: { message: 'Product Not Saved'}}); }
    });
  });
};

function update (req, res, next) {
  Product.findById(req.params.id, function (err, p) {
    if (err) return next(err);
    p.name = req.body.name;
    p.description = req.body.description;
    p.save(function (err, saved) {
      if (err) return next(err);
      if (saved) {
        return res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(200, { success: { message: 'Product Updated' }}); }
        });
      }
      res.format({
        html: function(){ res.redirect('/admin/products'); },
        json: function(){ res.json(500, { error: { message: 'Product Not Updated'}}); }
      });
    });
  });
};

function remove (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function(err, deleted) {
    if (err) return next(err);
    if (deleted) {
      return res.format({
        html: function(){ res.redirect('/admin/products'); },
        json: function(){ res.json(200, { success: { message: 'Product Deleted Successfully'}}); }
      });
    }
    res.format({
      html: function(){ res.redirect('/admin/products'); },
      json: function(){ res.json(500, { error: { message: 'Product Not Deleted'}}); }
    });
  });
};

function adminList (req, res, next) {
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

function adminGet (req, res, next) {
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
    get: get
  , list: list
  , create: create
  , update: update
  , remove: remove
  , adminList: adminList
  , adminGet: adminGet
};