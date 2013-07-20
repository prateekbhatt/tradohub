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

  it('should open index page', function(done){
    browser.visit(config.baseUrl, function(){
      should.exist(browser.text('title'));
      done();
    });
  });

});