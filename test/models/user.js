var should = require('should')
  , path = require('path')
  , rootDir = path.join(__dirname, '../..')
  , server = require(path.join(rootDir, 'server'))
  , Account = require(path.join(rootDir, 'models', 'Account'))
  , db = require(path.join(rootDir, 'server', 'db'))
  , async = require('async')
  ;

describe('Account', function(){

  before(function(done){
    db.connect(done);
  });
  
  after(function(){
    db.disconnect();
  });

  beforeEach(function(done){
    Account.create({
      name: 'test Account'
      , description: 'test description'
    },
    function(err, saved){
      currentAccount = saved;
      done();
    });
  });

  afterEach(function(done){
    Account.remove({}, function(){
      done();
    });
  });

  it('creates a new category', function(done){
    Account.create({
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
    currentAccount.should.have.property('created');
  });

  it('should have updated field', function(){
    currentAccount.should.have.property('updated');
  });

  it('adds url property while saving new category', function(){
    currentAccount.should.have.property('url', 'test-category');
  });

  it('gets a category with #findById', function(){
    Account.findById(currentAccount._id, function (err, cat){
      should.not.exist(err);
      cat.should.have.property('_id');
    });
  });

  it('adds / removes a product from category', function(done){
    var categoryId = currentAccount._id
      , productId = categoryId // for testing
      ;

    async.series([
      function(cb){
        Account.addProduct(categoryId, productId, function(err, cat){              
        should.not.exist(err);
        cat.products.should.have.lengthOf(1);
          cb();
        })
      },
      function(cb){
        Account.removeProduct(categoryId, productId, function(err, cat){
          should.not.exist(err);
          cat.products.should.have.lengthOf(0);
          cb();
        });
      },
      function(){ done(); }
    ]);
  });
});