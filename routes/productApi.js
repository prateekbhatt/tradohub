module.exports = function (Product) {
  var products = function (req, res) {
    Product.getAllProducts(function (err, products) {
      if (products) {
        res.json(200, products);
      }
    });
  }
  var product = function (req, res) {
    product_url = req.params.product_url;
    Product.getProduct(product_url, function (err, product) {
      if (product) {
        res.json(200, product);
      } else {
        res.json(404, 'Product Not Found')
      }
    })
  }
  return {
      products: products
    , product: product

  }
}