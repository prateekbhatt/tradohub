'use strict';

module.exports = {
    baseUrl: 'http://localhost:8000/'
  , port: 8000
  , dbPath: 'mongodb://localhost/amdavadtest'
  , cookieSecret: 'COOKIE_SECRET'
  , sessionSecret: 'SESSION_SECRET'
  , redis: {
      host: 'localhost'
    , port: 6379
    , db: 'tradohub'
  }
  , adminMail: 'ADMIN_EMAIL_ADDRESS'
  , aws: {
      key: 'AWS_KEY'
    , secret: 'AWS_SECRET'
    , bucket: 'AWS_DEV_BUCKET'
    , prodBucket: 'AWS_PRODUCTION_BUCKET' // used only to upload static files through grunt js
  }
  , mailer: {
      _from: '"Tradohub.com"  <support@tradohub.com>'
    , _replyTo: '"Tradohub.com" <support@tradohub.com>'
    , templatePath: __dirname + '/../views/emails/'
    , debug: false
  }
  , prettyHtml: false
  , staticFiles: {
      mainCss: '/css/tradohub-main.min.css'
    , mainJs: '/js/tradohub-main.min.js'
    , quoteJs: '/js/tradohub-quote.min.js'
    , logoUrl: '/img/tradohub-blue-logo.png'
    
  }
}