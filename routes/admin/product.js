'use strict';

var Product = require('../../models/Product')
  , Category = require('../../models/Category')
  , async = require('async')
  ;

function get (req, res, next) {
  Product.findOne({ url: req.params.url })
    .populate('category')
    .exec(function (err, product) {
      if (err) return next(err);
      if (product) {
        res.locals.imageUrl = product.getImagePath();
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
  Product.find({})
    .populate('category')
    .sort({ 'name': 1 })
    .exec(function (err, products) {
      res.locals.products = products;
      res.render('admin/products',
        { success: req.flash('success'), error: req.flash('error') });
    });
};

function create (req, res, next) {

  var savedProduct;
  var product = {
      name: req.body.name
    , category: req.body.category
    , description: req.body.description
  };

  async.series(
    [
      // create product
      function (cb){
        Product.create(product, function (err, pro){
          if (err) return cb(err);
          savedProduct = pro;
          cb();
        });
      },

      // add product to category
      function (cb){
        Category.addProduct(savedProduct.category, savedProduct._id, function (err, c){
          if (err) return cb(err);
          cb();
        });
      }
    ],

    // redirect to admin products page
    function (err, result){
      if (err) return next(err);
      res.redirect('/admin/products');
    }
  );
};

function update (req, res, next) {
  console.log('\n\n inside product update : ', req.body)

  var productId = req.params.id;
  var product
    , newName = req.body.name
    , newDescription = req.body.description
    , categoryUpdated = false
    , newCategory = req.body.category
    , oldCategory
    ;

  async.series(
    [
      // get product
      function (cb){
        Product.findById(productId, function (err, p){
          if (err) return cb(err);
          product = p;
          cb();
        });
      },

      // check if category updated and assign oldCategory and product category values
      function (cb){
        oldCategory = product.category;
        if (!oldCategory || (oldCategory.toString() != newCategory.toString())){
          categoryUpdated = true;
          product.category = newCategory;
          cb();
        } else {
          cb();
        }
      },

      // assign new name and description values and save product
      function (cb){
        product.name = newName;
        product.description = newDescription;
        product.save(function (err, saved){
          if (err) return cb(err);
          cb();
        });
      },

      // remove product from old category
      function (cb){
        if (categoryUpdated){
          Category.removeProduct(oldCategory, product._id, function (err, cat) {
            if (err) return cb(err);
            cb();
          });
        } else {
          cb();
        }
      },

      // add product to new category
      function (cb){
        if (categoryUpdated){
          Category.addProduct(product.category, product._id, function (err, cat) {
            if (err) return cb(err);
            cb();
          });
        } else {
          cb();
        }
      }

    ],

    // redirect to admin products page
    function (err, result){
      if (err) return next(err);
      res.redirect('/admin/products')
    }
  )
};

//   Product.findById(productId, function (err, p) {

//     if (err) return next(err);
//     var categoryUpdated = false
//       , oldCategory = p.category
//       , newCategory = req.body.category
//       ;

//     p.name = req.body.name;
//     p.description = req.body.description;

//     if (!oldCategory || (oldCategory.toString() != req.body.category.toString())) {
//       p.category = newCategory;
//       categoryUpdated = true;
//       console.log('\n\ncategoryUpdated\n');      
//     }
    
//     p.save(function (err, savedP) {
//       if (err) return next(err);
//       if (savedP && categoryUpdated) {

//         // Remove product from old category
//         Category.removeProduct(oldCategory, p._id, function (err, removed) {
//           if (removed) {
//             console.log('Product ', p.name, ' removed from ', oldCategory, ' category');
//           }
//         });

//         // Add product to new category
//         Category.addProduct(savedP.category, savedP._id, function (err, c) {
//           if (err) return next(err);
//           if (c) {
//             return res.redirect('/admin/products');              
//           }
//         });
//       } else {
//         return res.redirect('/admin/products');
//       }
//     });
//   });
// };

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

function remove (req, res, next){
  var product
    , pid = req.params.id
    ;

  async.series(
    [
      // remove product
      function (cb){
        Product.findByIdAndRemove(pid, function (err, pro){
          if (err) return cb(err);
          product = pro;
          cb();
        });
      },

      // remove product id from category
      function (cb){
        Category.removeProduct(product.category, product._id, function (err, r){
          if (err) return cb(err);
          cb();
        });
      },

      // remove product image from aws s3
      function (cb){
        product.deleteImage(cb);
      }
    ],

    // redirect to admin products page
    function (err, result){
      if (err) return next(err);
      res.redirect('/admin/products');
    }
  );

};

// function remove (req, res, next) {
//   Product.findByIdAndRemove(req.params.id, function(err, p) {
//     if (err) return next(err);
//     if (p) {
//       Category.removeProduct(p.category, p._id, function (err, r) {
//         if (r) {
//           return res.redirect('/admin/products');          
//         }
//       });
//     } else {
//       return res.redirect('/admin/products');      
//     }
//   });
// };

module.exports = {
    get: get
  , list: list
  , create: create
  , update: update
  , updateImage: updateImage
  , remove: remove
};