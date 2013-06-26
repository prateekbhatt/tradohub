var path = require('path')
  , rootDir = path.join(__dirname, '..')
  , Product = require(path.join(rootDir, 'models', 'Product'))
  , db = require(path.join(rootDir, 'server', 'db'))
  ;

describe('Product', function(){

  before(function(done){
    db.connect(done);
  });
  
  after(function(){
    db.disconnect();
  });

  beforeEach(function(done){
    Product.create({
      name: 'test Product'
      , description: 'test description'
    },
    function(err, saved){
      currentProduct = saved;
      done();
    });
  });

  afterEach(function(done){
    Product.remove({}, function(){
      done();
    });
  });

  it('creates a new product', function(){

  })

});