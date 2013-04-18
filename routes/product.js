module.exports = function (Product) {
  'use strict';

  function list (req, res) {
    Product.list(function (err, products) {
      if (products) {
        res.format({
          html: function(){
            res.locals.products = products;
            res.render('partials/products');
          },
          json: function(){ res.json(200, products); }
        });
      } else {
        res.format({
          html: function(){
            res.locals.products = null;
            res.render('partials/products');
          },
          json: function(){ res.json(400, { error: { message: 'No Product Found'}}); }
        });
      }
    });
  };
  
  function get (req, res) {
    var product_url = req.params.product_url;
    Product.get(product_url, function (err, product) {
      if (err) { console.log(err); }
      if (product) {
        res.format({
          html: function(){
            res.locals.product = product;
            res.render('partials/product');
          },
          json: function(){ res.json(200, product); }
        });
      } else {
        res.format({
          html: function(){ res.render('404'); },
          json: function(){ res.json(404, { error: { message: 'Product Not Found' }}); }
        });        
      }
    });
  };

  function create (req, res) {
    var product = {
      name: req.body.name
      , description: req.body.description
    };
    Product.create(product, function (err, product) {
      if (err) { console.log(err); } 
      if (product) {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(200, { success: { message: 'Product saved' }}); }
        });        
      } else {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(400, { error: { message: 'Product Not Saved'}}); }
        });        
      }
    });
  };

  function update (req, res) {
    var id = req.params.id;
    var product = {
      name: req.body.name
      , description: req.body.description
    };
    Product.update(id, product, function (err, isSaved) {
      if (err) { console.log(err); }
      if (isSaved) {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(200, { success: { message: 'Product Updated' }}); }
        });        
      } else {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(500, { error: { message: 'Product Not Updated'}}); }
        });        
      }
    });
  };

  function remove (req, res) {
    var id = req.params.id;
    Product.remove(id, function(err, isDeleted) {
      if (err) { console.log(err); }
      if (isDeleted) {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(200, { success: { message: 'Product Deleted Successfully'}}); }
        });        
      } else {
        res.format({
          html: function(){ res.redirect('/admin/products'); },
          json: function(){ res.json(500, { error: { message: 'Product Not Deleted'}}); }
        });                
      }
    });
  };

  function adminList (req, res) {
    Product.list(function (err, products) {
      if (products) {
        res.format({
          html: function(){
            res.locals.products = products;
            res.render('partials/admin/products');
          },
          json: function(){ res.json(200, products); }
        });
      } else {
        res.format({
          html: function(){
            res.locals.products = null;
            res.render('partials/admin/products');
          },
          json: function(){ res.json(400, { error: { message: 'No Product Found'}}); }
        });
      }
    });
  };

  function adminGet (req, res) {
    var product_url = req.params.product_url;
    Product.get(product_url, function (err, product) {
      if (err) { console.log(err); }
      if (product) {
        res.format({
          html: function(){
            res.locals.product = product;
            res.render('partials/admin/product');
          },
          json: function(){ res.json(200, product); }
        });
      } else {
        res.format({
          html: function(){ res.render('404'); },
          json: function(){ res.json(404, { error: { message: 'Product Not Found' }}); }
        });        
      }
    });
  };

  return {
      list: list
    , get: get
    , create: create
    , update: update
    , remove: remove
    , adminList: adminList
    , adminGet: adminGet
  };
};