'use strict';

var config = require('../config');
var nodemailer = require('nodemailer');

var EmailAddressRequiredError = new Error('email address and subject required');

// create a defaultTransport using AWS SES and authentication that are
// storeed in the `config.js` file.
var transport = nodemailer.createTransport("SES", {
  AWSAccessKeyID: config.mailer.AWSAccessKeyID,
  AWSSecretKey: config.mailer.AWSSecretKey
});

exports.sendOne = function (locals, fn) {
  // make sure that we have an user email and a subject
  if (!locals.email || !locals.subject) {
    return fn(EmailAddressRequiredError);
  }
  var mailOptions = {
    from: config.mailer.defaultFromAddress,
    to: locals.email,
    subject: locals.subject,
    text: locals.text
  };
  transport.sendMail(mailOptions, function (err, responseStatus) {
    if (err) {
      return fn(err);
    }
    return fn(null, responseStatus.message);
  });
}