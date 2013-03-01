var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }
  , description: { type: String }
  , url: { type: String }
})

productSchema.pre('save', function(next) {
  // console.log('CREATING PRODUCT URL FOR: ' + this.name);
  var product = this;
  this.url = this.name.toLowerCase().split(' ').join('-');
  return next();
});

var Product = mongoose.model('Product', productSchema);

var productsObj = [
    { name: 'Long Product Steel' }
  , { name: 'Flat Product Steel' }
  , { name: 'Chemical A' }
  , { name: 'Chemical B' }
  , { name: 'Chemical C' }
]

var seedProducts = function (product, fn) {
  var newProduct = product['name']
  console.log('newProduct: ' + newProduct);
  Product.findOne({ name: newProduct }, function(err, product) {
    if (err) {
      console.log('ERROR WHILE FINDING PRODUCT: ' + err);
      fn(err);
    }
    if (!product) { 
      console.log('PRODUCT NOT FOUND');
      var product1 = new Product({ name: newProduct, description: 'description of product goes here' })
      product1.save(function (err, product) {
        if (err) {
          console.log('Error while saving product: ' + err);
          fn(err);
        } else {
          console.log(product.name + ' : ' + product.url + ' is saved!');
          fn(null, true);
        }
      });
    } else {
      console.log('PRODUCT FOUND: ' + product.name);
      fn(new Error('PRODUCT ALREADY EXISTS'));
    }
  })
}

for (var i in productsObj) {
  seedProducts(productsObj[i], function(err, isSaved) {
    if (err) { console.log(err); }
    if (!isSaved) {
      console.log('PRODUCT WAS NOT SAVED NOW');
    } else {
      console.log('PRODUCT IS SAVED!');
    }
  })
}

var createProductUrl = function (name) {
  if (name) {
    return name.toLowerCase().split(' ').join('-');
  }
}

// contains all the route functions for merchant dashboard

exports.index = function (req, res) {
  res.render('dashboard/dashboard');
};

// var allProducts = Product.find({}, function(err, products) {
//   // console.log('ALL PRODUCTS: ' + products);
//   return products;
// });
// console.log('ALL PRODUCTS: ' + allProducts);

exports.products = function (req, res, next) {
  if (req.params.product_url) {
    console.log('PRODUCT_URL: ' + req.params.product_url);
    Product.findOne({ url: req.params.product_url }, function(err, product) {
      if (err) { console.log(err); }
      if (!product) {
        console.log('PRODUCT NOT FOUND');
        next();
      } else {
        res.render('dashboard/product', {'products': null, 'product': product });        
      }
    })
  } else {
    Product.find({}, function(err, products) {
      res.render('dashboard/product', {'products': products });      
    });
  }
};

exports.rfq = function (req, res) {
  res.render('dashboard/rfq');
}