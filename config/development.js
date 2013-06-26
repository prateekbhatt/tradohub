'use strict';

module.exports = {
    baseUrl: 'http://localhost:8000/'
  , dbPath: 'mongodb://localhost/amdavad'
  , aws: {
    bucket: 'devdev424242'
  }
  , mailer: {
      debug: true
  }
  , prettyHtml: true
  , staticFiles: {
      mainCss: '/css/tradohub-main.min.css'
    , mainJs: '/js/tradohub-main.min.js'
    , quoteJs: '/js/tradohub-quote.min.js'
    , logoUrl: '/img/tradohub-blue-logo.png'
    
  }
}