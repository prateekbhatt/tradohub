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
      _from: 'Tradohub.com <support@tradohub.com>'
    , _replyTo: 'Tradohub.com <support@tradohub.com>'
    ,  debug: false
  }
  , prettyHtml: false
}