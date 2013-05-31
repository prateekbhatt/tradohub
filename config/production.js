'use strict';

module.exports = {
    baseUrl: 'http://tradohub.com/'
  , dbPath: 'mongodb://localhost/tradohub'
  , aws: {
      key: 'AKIAICEIHBPNOCUWGVUQ'
    , secret: '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'
    , bucket: 'tradohub'
  }
  , mailer: {
      _from: 'Tradohub Support <support@tradohub.com>'
    , _replyTo: 'Tradohub Support <support@tradohub.com>'
    ,  debug: false
  }
  , prettyHtml: false
}