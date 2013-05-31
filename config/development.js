'use strict';

module.exports = {
    baseUrl: 'http://localhost:8000/'
  , dbPath: 'mongodb://localhost/amdavad'
  , adminMail: 'prattbhatt@gmail.com'
  , aws: {
      key: 'AKIAICEIHBPNOCUWGVUQ'
    , secret: '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'
    , bucket: 'tradohub1'
    , prodBucket: 'tradohub' // used only to upload static files through grunt js
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