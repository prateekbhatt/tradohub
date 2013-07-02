var should = require('should')
  , async = require('async')
  , config = require('config')
  , path = require('path')
  , rootDir = path.join(__dirname, '../..')
  , Product = require(path.join(rootDir, 'models', 'Product'))
  , Category = require(path.join(rootDir, 'models', 'Category'))
  , db = require(path.join(rootDir, 'server', 'db'))
  ;

describe('Product', function(){
  var currentProduct
    , currentCategory
    ;
  
  
  before(function(done){
    db.connect(done);
  });
  
  after(function(){
    db.disconnect();
  });

  beforeEach(function(done){

    async.series([

      // seed category
      function (cb){
        Category.create({
          name: 'test Category'
          , description: 'test description'
        },
        function(err, saved){
          currentCategory = saved;
          cb();
        });
      },

      // seed product
      function (cb){
        Product.create({
          name: 'test Product'
          , description: 'test product description'
          , category: currentCategory._id
        },
        function(err, saved){
          currentProduct = saved;
          cb();
        });        
      }
    ],
    function (err, result){
      should.not.exist(err);
      done();
    });

  });

  afterEach(function(done){
    async.parallel([

      // remove products
      function (cb){
        Product.remove({}, function(err){
          if (err) return cb(err);
          cb();
        }); 
      },

      // remove categories
      function (cb){
        Category.remove({}, function(err){
          if (err) return cb(err);
          cb();
        });
      }
    ],
    function (err, result){
      should.not.exist(err);
      done();
    });
  });

  it('creates a new product', function(){
    Product.create({
      name: 'Second test product'
      , description: 'awesome product mama'
      , category: currentCategory._id
    },
    function (err, savedProduct){
      should.not.exist(err);
      savedProduct.should.have.property('name', 'Second test product');
      savedProduct.should.have.property('description', 'awesome product mama');
      savedProduct.should.have.property('category', currentCategory._id);
    });
  });

  it('should add a #url field while product creation', function(){
    currentProduct.should.have.property('url', 'test-product');
  });

  it('should add #created field', function(){
    currentProduct.should.have.property('created');
  });

  it('should add #updated field', function(){
    currentProduct.should.have.property('updated');
  });

  describe('#updateImagePath', function(){

    it('should update the image path field in product', function(){
      currentProduct.should.have.property('image', null);
      currentProduct.updateImagePath('helo.jpeg', function (err, savedProduct){
        should.not.exist(err);
        savedProduct.image.should.equal('helo.jpeg');
      });
    });

    it('should return error if no image path is provided', function(){
      currentProduct.updateImagePath('', function (err, savedProduct){
        should.exist(err);
        should.not.exist(savedProduct);
      });
    });
  });

  describe('#getImagePath', function(){

    it('should return null if product does not have image', function(){
      var img = currentProduct.getImagePath();
      should.equal(img, null);
    });

    it('should return image file path in aws s3', function(){
      async.series([
        function (cb){
          currentProduct.updateImagePath('hola.jpg', function (err, savedProduct){
            currentProduct = savedProduct;
            cb();
          });
        },
        function (cb){
          var imagePath = 'https://s3.amazonaws.com/' + config.aws.bucket + '/static/img/products/' + 'hola.jpg';
          should.equal(currentProduct.getImagePath(), imagePath);
          cb();
        }
      ]);
    });
  });

});