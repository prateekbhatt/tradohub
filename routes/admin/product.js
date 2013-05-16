'use strict';

var Product = require('../../models/Product')
  , Category = require('../../models/Category')
  , File = require('../../models/File')
  ;


function get (req, res, next) {
  Product.findOne({ url: req.params.url }).populate('category').populate('image').exec(function (err, product) {
    if (err) return next(err);
    if (product) {
      res.locals.imageUrl = product.image ? product.image.getFullPath() : null;
      res.locals.product = product;
      return res.render('admin/product');      
    } else {
      res.render('404');      
    }
  });
};

function list (req, res, next) {
  // passing category using the 'categories' middleware on app.js
  Product.find({}).populate('category').sort({ 'name': 1 }).exec(function (err, products) {
    res.locals.products = products;
    res.render('admin/products');
  });
};

function create (req, res, next) {
  var product = {
      name: req.body.name
    , category: req.body.category
    , description: req.body.description
  };

  var file = req.files ? req.files.image : null
    , fileType = 'products'
    , permission = 'public'
    ;

  Product.create(product, function (err, savedP) {
    if (err) return next(err);
    if (savedP) {

      // upload image file to aws ses
      File.create(file, fileType, permission, function (err, savedF) {
        if (err) console.log(err);
        if (savedF) {
          savedP.image = savedF._id;
          savedP.save(function (err, imageSaved) {
            console.log('image updated!\n\n');              
          });
        }
      });

      Category.findById(savedP.category, function (err, c) {
        if (err) return next(err);
        if (!c.products || !c.products.length) c.products = [];
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

function updateImage (req, res, next) {
  var pid = req.params.id;
  Product.findById(pid).exec(function (err, p) {
    if (err) return next(err);
    if (p) {
      var file = req.files ? req.files.image : null
        , fileType = 'products'
        , permission = 'public'
        ;
      // if product has an existing image, update the file
      if (p.image) {
        File.update(p.image, file, permission, function (err, f) {
          if (err) return next(err);
          return res.redirect('/admin/products/'+p.url);
        });
      } else {
        // if product doesnot have an existing image, create a new file
        File.create(file, fileType, permission, function (err, f) {
          if (err) return next(err);
          return res.redirect('/admin/products/'+p.url);
        });
      }
    } else {
      res.redirect('/admin/products');
    }
  }
)};

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