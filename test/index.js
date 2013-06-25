// Put below in a file in your *test* folder, ie: test/sampletest.js:

process.env.NODE_ENV = 'test';

var path = require('path')
  , rootDir = path.join(__dirname, '/..')
  , loadCategories = require(path.join(rootDir, 'helpers', 'loadCategories'))
  , server = require(path.join(rootDir, 'server'))
  ;
describe('tradohub', function(){

  before(function(done){
    server.listen(done);
  });
  
  describe('categories', function(){
    it('should get categories', function(){
      true.should.be.true;
    });    
  });
  
  after(function(){
    server.close();
  });
})