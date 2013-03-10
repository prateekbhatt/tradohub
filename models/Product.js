'use strict';
module.exports = function (mongoose, tree) {

  var ProductSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true }
    , description: { type: String }
    , url: { type: String }
  });

  // Implement the mongoose-tree plugin for nested tree structure
  // ProductSchema.plugin(tree);

  ProductSchema.pre('save', function(next) {
    var product = this;
    this.url = this.name.toLowerCase().split(' ').join('-');
    return next();
  });

  var Product = mongoose.model('Product', ProductSchema);

  var getProduct = function getProduct (product_url, fn) {
    Product.findOne({ url: product_url }, function(err, product) {
      err ? fn(err) : fn(null, product);
    });
  };

  var getAllProducts = function getAllProducts (fn) {
    Product.find({}, function(err, products) {
      err ? fn(err) : fn(null, products);
    });
  };

  var addProduct = function addProduct (product, fn) {
    var newProduct = new Product({ name: product.name, description: product.description });
    newProduct.save(function (err, savedProduct) {
      err ? fn(err) : fn(null, savedProduct);
    });
  };

  var editProduct = function editProduct (id, product, fn) {
    Product.findById(id, function (err, prod) {
      if (err) { return fn(err); }
      if (prod) {
        prod.name = product.name;
        prod.description = product.description;
        prod.save(function (err, savedProduct) {
          err ? fn(err) : fn(null, savedProduct);
        });
      };
    });
  };

  var deleteProduct = function deleteProduct (id, fn) {
    Product.findByIdAndRemove(id, function (err, product) {
      err ? fn(err) : fn(null, product);
    });
  };

  return {
      Product: Product
    , getProduct: getProduct
    , getAllProducts: getAllProducts
    , addProduct: addProduct
    , editProduct: editProduct
    , deleteProduct: deleteProduct
  }
};