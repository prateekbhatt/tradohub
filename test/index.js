// Put below in a file in your *test* folder, ie: test/sampletest.js:

var assert = require('assert'),
Browser = require('zombie'),
browser = new Browser();

describe('Loads pages', function(){

    it('Google.com', function(done){

        browser.visit("http://www.google.com", function () {
            assert(browser.text("title") == 'Google');
            done();
        });
    });

});