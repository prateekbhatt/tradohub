var should = require('should')
  , path = require('path')
  , rootDir = path.join(__dirname, '..')
  , validateFile = require(path.join(rootDir, 'helpers', 'validateFile'))
  , db = require(path.join(rootDir, 'server', 'db'))
  ;

describe('validateFile', function(){

  it('should return error for input with no file name', function(){
    validateFile('', function (err, ext){
      should.exist(err);
      should.equal(ext, null);
    })
  });

  it('should return error for input with invalid extension', function(){
    validateFile('abcdefgh.fdsa', function (err, ext){
      should.exist(err);
      should.equal(ext, null);
    });
  });

  it('should return extension for input with valid extension', function(){
    validateFile('abcdef.jpeg', function (err, ext){
      should.not.exist(err);
      should.equal(ext, '.jpeg');
    });
  });

});