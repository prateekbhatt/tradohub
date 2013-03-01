module.exports = function (Product) {

  // contains all the route functions for merchant dashboard

  var index = function (req, res) {
    res.render('dashboard/dashboard');
  };

  // var allProducts = Product.find({}, function(err, products) {
  //   // console.log('ALL PRODUCTS: ' + products);
  //   return products;
  // });
  // console.log('ALL PRODUCTS: ' + allProducts);

  var products = function (req, res, next) {
    var product_url = req.params.product_url;
    if (product_url) {
      console.log('PRODUCT_URL: ' + product_url);
      Product.getProduct(product_url, function(err, product) {
        if (err) { console.log(err); }
        if (!product) {
          console.log('PRODUCT NOT FOUND');
          next();
        } else {
          res.render('dashboard/product', {'products': null, 'product': product });        
        }
      })
    } else {
      Product.getAllProducts(function (err, products) {
        res.render('dashboard/product', {'products': products });      
      });
    }
  };

  var rfq = function (req, res) {
    res.render('dashboard/rfq');
  }

  return {
      index: index
    , products: products
    , rfq: rfq
  }
}