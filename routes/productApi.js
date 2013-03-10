module.exports = function (Product) {
  var products = function (req, res) {
    Product.getAllProducts(function (err, products) {
      if (products) {
        res.json(200, products);
      }
    });
  };
  var product = function (req, res) {
    var product_url = req.params.product_url;
    Product.getProduct(product_url, function (err, product) {
      if (product) {
        res.json(200, product);
      } else {
        res.json(404, 'Product Not Found')
      }
    })
  };
  var addProduct = function (req, res) {
    var product = req.body.product;
    Product.addProduct(product, function (err, product) {
      if (err) {
        console.log(err);
        res.json(500);
      } 
      if (product) {
        res.json(200, 'Product saved');
      } else {
        res.json(400, 'Product Not Saved');
      }
    });
  };
  var editProduct = function (req, res) {
    var id = req.params.id;
    var product = req.body.product;
    Product.editProduct(id, product, function (err, isSaved) {
      if (err) {
        console.log(err);
        res.json(500, 'Product Not Updated');
      }
      if (isSaved) { res.json(200); }
    });
  };

  var deleteProduct = function (req, res) {
    var id = req.params.id;
    Product.deleteProduct(id, function(err, isDeleted) {
      if (err) {
        console.log(err);
        res.json(500, 'Product Not Deleted');
      }
      if (isDeleted) { res.json(200); }
    })
  }

  return {
      products: products
    , product: product
    , addProduct: addProduct
    , editProduct: editProduct
    , deleteProduct: deleteProduct

  }
}