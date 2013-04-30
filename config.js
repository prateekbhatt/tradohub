'use strict';

module.exports = {
    adminMail: 'prattbhatt@gmail.com'
  , aws: {
        key: 'AKIAICEIHBPNOCUWGVUQ'
      , secret: '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'
      , bucket: 'tradohub1'
    }
  , mailer: {
      defaultFromAddress: 'Prateek Bhatt <prattbhatt@gmail.com>'
    }
  , development: {
      root: require('path').normalize(__dirname + '/..'),
      // db: 'mongodb://localhost/noobjs_dev',
      // google: {
      //     clientID: "APP_ID"
      //   , clientSecret: "APP_SECRET"
      //   , callbackURL: "http://localhost:3000/auth/google/callback"
      // },
    }
  , test: {

    }
  , production: {

    }
}