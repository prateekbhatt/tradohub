var should = require('should')
  , path = require('path')
  , rootDir = path.join(__dirname, '..')
  , server = require(path.join(rootDir, 'server'))
  , Category = require(path.join(rootDir, 'models', 'Category'))
  , db = require(path.join(rootDir, 'server', 'db'))
  , async = require('async')
  ;

describe('Category', function(){

  before(function(done){
    db.connect(done);
  });
  
  after(function(){
    db.disconnect();
  });

  beforeEach(function(done){
    Category.create({
      name: 'test Category'
      , description: 'test description'
    },
    function(err, saved){
      currentCategory = saved;
      done();
    });
  });

  afterEach(function(done){
    Category.remove({}, function(){
      done();
    });
  });

  it('creates a new category', function(done){
    Category.create({
      name: 'test category2'
      , description: 'test2 description'
    },  
    function(err, saved){
      saved.should.have.property('name', 'test category2');
      saved.should.have.property('description', 'test2 description');
      done();
    });
  });

  it('should have created field', function(){
    currentCategory.should.have.property('created');
  });

  it('should have updated field', function(){
    currentCategory.should.have.property('updated');
  });

  it('adds url property while saving new category', function(){
    currentCategory.should.have.property('url', 'test-category');
  });

  it('gets a category with #findById', function(){
    Category.findById(currentCategory._id, function (err, cat){
      should.not.exist(err);
      cat.should.have.property('_id');
    });
  });

  it('adds / removes a product from category', function(done){
    var categoryId = currentCategory._id
      , productId = categoryId // for testing
      ;

    async.series([
      function(cb){
        Category.addProduct(categoryId, productId, function(err, cat){              
        should.not.exist(err);
        cat.products.should.have.lengthOf(1);
          cb();
        })
      },
      function(cb){
        Category.removeProduct(categoryId, productId, function(err, cat){
          should.not.exist(err);
          cat.products.should.have.lengthOf(0);
          cb();
        });
      },
      function(){ done(); }
    ]);
  });
});