'use strict';


var mailer = require('../../helpers/mailer')
  , config = require('config')
  ;
// for sending test emails

function testEmailPage (req, res, next) {
  res.render('admin/test-email',
    { error: req.flash('error'), success: req.flash('success') });
};

function sendTestEmail (req, res, next) {
  var user = {}
    , email = req.body.email
    ;
  user.email = email;
  user.title = 'Tradohub Test Email' ;
  if (user.email) {
    mailer.sendTestEmail(user);
    req.flash('success', 'Sending test email.');
  } else {
    req.flash('error', 'Failed. Try Again.');
  }
  res.redirect('/admin/testEmail');
};

module.exports = {
  testEmailPage: testEmailPage
  , sendTestEmail: sendTestEmail
}