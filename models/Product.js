module.exports = function (mongoose) {

  var productSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true }
    , description: { type: String }
    , url: { type: String }
  });

  productSchema.pre('save', function(next) {
    var product = this;
    this.url = this.name.toLowerCase().split(' ').join('-');
    return next();
  });

  var Product = mongoose.model('Product', productSchema);

  // Seed products  
  var productsObj = [
      { name: 'Long Product Steel' }
    , { name: 'Flat Product Steel' }
    , { name: 'Chemical A' }
    , { name: 'Chemical B' }
    , { name: 'Chemical C' }
  ]

  var seedProduct = function (product, fn) {
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
    seedProduct(productsObj[i], function(err, isSaved) {
      if (err) { console.log(err); }
      if (!isSaved) {
        console.log('PRODUCT WAS NOT SAVED NOW');
      } else {
        console.log('PRODUCT IS SAVED!');
      }
    });
  }

  var getProduct = function (product_url, fn) {
    Product.findOne({ url: product_url }, function(err, product) {
      if (err) { return fn(err); }
      if (!product) {
        return fn (null, '');
      } else {
        return fn (null, product);  
      }
    });
  };

  var getAllProducts = function (fn) {
    Product.find({}, function(err, products) {
      if (err) { return fn(err); }
      if (!products) {
        return fn (null, '');
      } else {
        return fn (null, products);  
      }
    });
  };

  return {
      getProduct: getProduct
    , getAllProducts: getAllProducts
  }
};