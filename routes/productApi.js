module.exports = function (Product) {
  'use strict';
  var products = function (req, res) {
    Product.getAllProducts(function (err, products) {
      if (products) {
        res.json(200, products);
      } else {
        res.json(400, { error: { message: 'No Product Found'}});
      }
    });
  };
  var product = function (req, res) {
    var product_url = req.params.product_url;
    Product.getProduct(product_url, function (err, product) {
      if (err) { console.log(err); }
      if (product) {
        res.json(200, product);
      } else {
        res.json(404, { error: { message: 'Product Not Found' }});
      }
    });
  };
  var addProduct = function (req, res) {
    var product = req.body.product;
    Product.addProduct(product, function (err, product) {
      if (err) { console.log(err); } 
      if (product) {
        res.json(200, { success: { message: 'Product saved' }});
      } else {
        res.json(400, { success: { message: 'Product Not Saved'}});
      }
    });
  };
  var editProduct = function (req, res) {
    var id = req.params.id;
    var product = req.body.product;
    Product.editProduct(id, product, function (err, isSaved) {
      if (err) { console.log(err); }
      if (isSaved) {
        res.json(200, { success: { message: 'Product Updated' }});
      } else {
        res.json(500, { error: { message: 'Product Not Updated'}});        
      }
    });
  };

  var deleteProduct = function (req, res) {
    var id = req.params.id;
    Product.deleteProduct(id, function(err, isDeleted) {
      if (err) { console.log(err); }
      if (isDeleted) {
        res.json(200, { success: { message: 'Product Deleted Successfully'}});
      } else {
        res.json(500, { error: { message: 'Product Not Deleted'}});        
      }
    });
  };

  return {
      products: products
    , product: product
    , addProduct: addProduct
    , editProduct: editProduct
    , deleteProduct: deleteProduct
  };
};