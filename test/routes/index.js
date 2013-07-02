var Browser = require('zombie')
  , should = require('should')
  , config = require('config')
  , path = require('path')
  , rootDir = path.join(__dirname, '../..')
  , server = require(path.join(rootDir, 'server'))
  ;

describe('index page', function(){

  var browser
    ;

  before(function(done){
    browser = new Browser();
    server.listen(done);
  });

  after(function(){
    server.close();
  });

  it('should open index page', function(){
    browser.visit(config.baseUrl, function(){
      should.ok(browser.success);
    });
  });
});