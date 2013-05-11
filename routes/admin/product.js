'use strict';

var Product = require('../../models/Product')
  , Category = require('../../models/Category')
  , File = require('../../models/File')
  , fileValidate = require('../../helpers/fileValidate')
  ;


function get (req, res, next) {
  Product.findOne({ url: req.params.url }).populate('category').exec(function (err, product) {
    if (err) return next(err);
    if (product) {
      res.locals.product = product;
      return res.render('admin/product');      
    } else {
      res.render('404');      
    }
  });
};

function list (req, res, next) {
  // passing category using the 'categories' middleware on app.js
  res.render('admin/products');
};

function create (req, res, next) {
  var product = {
      name: req.body.name
    , category: req.body.category
    , description: req.body.description
  };

  // console.log(req);
  console.log('\n\n\n', req.files);

  var file = req.files.image
    , fileType = 'products'
    , fileExt = fileValidate(file.name)
    ;

  Product.create(product, function (err, savedP) {
    if (err) return next(err);
    if (savedP) {

      // upload image file to aws ses
      File.create(file.path, fileType, fileExt, function (err, savedF) {
        if (err) console.log(err);
        if (savedF) {
          savedP.updateImage(savedF._id, function (err, updated) {
            console.log('image updated!\n\n')
            console.log(err, updated);
          });
        }
      });

      Category.findById(savedP.category, function (err, c) {
        if (err) return next(err);
        c.products.push(savedP._id);
        c.save(function (err, savedC) {
          res.redirect('/admin/products');
        });
      });
    } else {
      return res.redirect('/admin/products');
    }
  });
};

function update (req, res, next) {
  console.log('\n\n inside product update : ', req.body)
  Product.findById(req.params.id, function (err, p) {
    if (err) return next(err);
    var categoryUpdated = false
      , oldCategory = p.category
      , newCategory = req.body.category
      ;
    p.name = req.body.name;
    p.description = req.body.description;

    if (!oldCategory || (oldCategory.toString() != req.body.category.toString())) {
      p.category = newCategory;
      categoryUpdated = true;
      console.log('\n\ncategoryUpdated\n');      
    }
    
    p.save(function (err, savedP) {
      if (err) return next(err);
      if (savedP && categoryUpdated) {

        // Remove product from old category
        Category.removeProduct(oldCategory, p._id, function (err, removed) {
          if (removed) {
            console.log('Product ', p.name, ' removed from ', oldCategory, ' category');
          }
        });

        // Add product to new category
        Category.addProduct(savedP.category, savedP._id, function (err, c) {
          if (err) return next(err);
          if (c) {
            return res.redirect('/admin/products');              
          }
        });
      } else {
        return res.redirect('/admin/products');
      }
    });
  });
};

function remove (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function(err, deleted) {
    if (err) return next(err);
    if (deleted) {
      res.redirect('/admin/products');
    }
    res.redirect('/admin/products');
  });
};

module.exports = {
    get: get
  , list: list
  , create: create
  , update: update
  , remove: remove
};