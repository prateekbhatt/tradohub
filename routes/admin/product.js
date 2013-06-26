'use strict';

var Product = require('../../models/Product')
  , Category = require('../../models/Category')
  ;

function get (req, res, next) {
  Product.findOne({ url: req.params.url }).populate('category').exec(function (err, product) {
    if (err) return next(err);
    if (product) {
      res.locals.imageUrl = product.image ? product.getImagePath() : null;
      res.locals.product = product;
      return res.render('admin/product',
        { success: req.flash('success'), error: req.flash('error') });
    } else {
      res.render('404');
    }
  });
};

function list (req, res, next) {
  // passing category using the 'categories' middleware on app.js
  Product.find({}).populate('category').sort({ 'name': 1 }).exec(function (err, products) {
    res.locals.products = products;
    res.render('admin/products',
      { success: req.flash('success'), error: req.flash('error') });
  });
};

function create (req, res, next) {
  var product = {
      name: req.body.name
    , category: req.body.category
    , description: req.body.description
  };

  Product.create(product, function (err, savedP) {
    if (err) return next(err);
    if (savedP) {

      // Add product to category
      Category.addProduct(savedP.category, savedP._id, function (err, c) {
        if (err) return next(err);
        if (c) {
          return res.redirect('/admin/products');              
        }
      });

      // Category.findById(savedP.category, function (err, c) {
      //   if (err) return next(err);
      //   if (!c.products || !c.products.length) c.products = [];
      //   c.products.push(savedP._id);
      //   c.save(function (err, savedC) {
      //     res.redirect('/admin/products');
      //   });
      // });
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

function updateImage (req, res, next) {
  var pid = req.params.id
    , file = req.files ? req.files.image : null
    ;

  if (file) {
    Product.updateImage(pid, file, function (err, updated) {
      if (err) return next(err);
      if (updated) {
        req.flash('success', 'Product image updated');
      } else {
        req.flash('error', 'Product image not updated');
      }
      return res.redirect('/admin/products');
    })    
  } else {
    req.flash('error', 'Please upload a valid file');
    res.redirect('/admin/products');
  }
};

function remove (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function(err, p) {
    if (err) return next(err);
    if (p) {
      Category.removeProduct(p.category, p._id, function (err, r) {
        if (r) {
          return res.redirect('/admin/products');          
        }
      });
    } else {
      return res.redirect('/admin/products');      
    }
  });
};

module.exports = {
    get: get
  , list: list
  , create: create
  , update: update
  , updateImage: updateImage
  , remove: remove
};