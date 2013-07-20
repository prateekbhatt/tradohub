'use strict';

// https://gist.github.com/1128956/4ca62b1b34a69f818fdd5bd7e3ee0cf8bf060b86

/*!
 * Mailer - A nodemailer wrapper library that makes it easy to send emails using Express and Jade templates.
 * Copyright(c) 2011 Tom Shaw <tom@tomshaw.info>
 * MIT Licensed
 */
 
/**
 * Module dependencies.
 */
var nodemailer = require('nodemailer')
  , jade = require('jade')
  , path = require('path')
  , config = require('config')
  , juice = require('juice')
  ;

/**
 * Mailer pseudo class.000
 * 
 * @param user 
 *  
 */
var Mailer = function Mailer(user) {
  if (user) this.merge(this, { _userdata: user });
  if (config.mailer) this.merge(this, config.mailer);
  if (config.aws) this.merge(this, config.aws);
  this.transport = nodemailer.createTransport("SES", {
      AWSAccessKeyID: this.key
    , AWSSecretKey: this.secret
  });
};
 
/**
 * Mailer prototype.
 */
 
Mailer.prototype = {
  
  /**
   * Merges object properties.
   */
  merge: function(a, b) {
    if (a && b) {
      for (var k in b) {
        a[k] = b[k];
      }
    }
    return a;
  },
 
  /**
   * @returns User data fetched from persistence fed in thru the object constructor.
   */
  get userdata() {
    return this._userdata;
  },
 
  /**
   * Generates some basic email instructions for nodemailer.
   * 
   * _to: - Who the email is being sent to.
   * _sender: - Who the email is being sent from.
   * _subject: - The defauly email subject.
   * _reply_to: - The email address to reply to. 
   * 
   * @returns Creates and returns an array of default email data.
   */
  get data() {
    return {
        from: this._from
      , to: this.userdata.email
      , replyTo: this._replyTo
      , subject: this._subject
      , generateTextFromHTML: true
    }
  },
  /**
   * Renders an inlined html template from the jade template
   */
  jadeToInlinedHtml: function(fn) {
    var userdata = this.userdata;
    jade.renderFile(this.templatePath + this._template, { locals: userdata }, function(err, htmlFile){
      if (err) return fn(err);
      juice.juiceContent(htmlFile, { url: config.baseUrl} , function (err, inlinedHtml){
        return fn(err, inlinedHtml);
      });
    });
  },


  /**
   * Sends the actual email message with Jade template.
   */
  send: function() {
    var data = this.data;
    var transport = this.transport;
    this.jadeToInlinedHtml(function (err, html){
      if (err) return console.log(err);
      data.html = html;
      transport.sendMail(data, function (err, responseStatus){
        // if (err) console.log(err);
        if (responseStatus) {
          console.log('[SUCCESSFULL EMAIL SENT TO]: ' + data.to);
          console.log(responseStatus.message);
        }
      })
    })
  },
  
  /**
   * Returns objects properties in JSON format.
   */
  toJSON: function() {
    return this.data;
  }
  
};
 
/**
 * Exposed methods.
 */
 
/**
 * Send a registration email confirmation message.
 */
module.exports.sendEmailVerification = function(user) {
  var mailer = new Mailer(user);
  mailer._subject = 'Tradohub : Email Confirmation';
  mailer._template = 'emailVerification.jade';
  mailer.send();
  return mailer;
}
 
/**
 * Sends a message after email is verified.
 */
module.exports.sendEmailVerified = function(user) {
  var mailer = new Mailer(user);
  mailer._subject = 'Tradohub : Email has been verified';
  mailer._template = 'emailVerified.jade';
  mailer.send();
  return mailer;
}

/**
 * Send a forgot password link.
 */
module.exports.sendForgotPassword = function(user) {
  var mailer = new Mailer(user);
  mailer._subject = 'Tradohub Forgot Password';
  mailer._template = 'forgotPassword.jade';
  mailer.send();
  return mailer;
}

/**
 * Send quote of products requested by user.
 */
module.exports.sendQuote = function(user) {
  var mailer = new Mailer(user);
  mailer._subject = 'Tradohub quote for your order: ' + user.tid;
  mailer._template = 'quote.jade';
  mailer.send();
  return mailer;
}

/**
 * Send account status of user.
 */
module.exports.sendAccountStatus = function(user) {
  var mailer = new Mailer(user);
  if (user.status == 'activated') {
    mailer._subject = ' Welcome to Tradohub! Account activated';
  } else {
    mailer._subject = ' Tradohub: Your account has been ' + user.status + '.';
  }
  mailer._template = 'accountStatus.jade';
  mailer.send();
  return mailer;
}

/**
 * Send partnership request to admin mail
 */
module.exports.sendAdmin = function(user) {
  console.log(user);
  var mailer = new Mailer(user);
  mailer._subject = 'Tradohub: New Request';
  mailer._template = 'admin.jade';
  mailer.send();
  return mailer;
}

/**
 * Send partnership request to admin mail
 */
module.exports.sendInvite = function(user) {
  var mailer = new Mailer(user)
    , company = user.company || ''
    , title = user.title
    ;
  mailer._subject = company ? company + ' : ' + title : title;
  mailer._template = 'zurb.jade';
  mailer.send();
  return mailer;
}

/**
 * For testing purposes only
 */
module.exports.sendTestEmail = function(user) {
  var mailer = new Mailer(user)
    , title = user.title
    ;
  mailer._subject = 'Tradohub Quote for LLDPE';
  mailer._template = 'quote-with-css.jade';
  mailer.send();
  return mailer;
}
