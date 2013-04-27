'use strict';

var User = require('../models/User')
  , UserToken = require('../models/UserToken')
  , sendMail = require('../helpers/mailer').sendMail
  , countryList = require('../helpers/countryList')
  ;

function loginPage (req, res) {
  res.render('partials/login', { error: req.flash('error'), success: req.flash('success') });    
};

function registerPage (req, res) {
  res.locals.countryList = countryList;
  res.render('partials/register', { error: req.flash('error') });
};

function passwordForgotPage (req, res) {
  res.render('partials/forgot', { error: req.flash('error') });
};

function logout (req, res) {
  req.logout();
  req.flash('success', 'You have been logged out.')
  res.redirect('/');
};

/*
* POST /password/forgot
*/

function passwordForgot (req, res, next) {
  req.onValidationError(function (msg) {
    //Redirect to `/password/forgot` if email is bogus
    req.flash('error', msg);
    res.redirect('/password/forgot');
  });
  req.check('email', 'Please enter a valid email').len(1).isEmail();

  if (!req.validationErrors()) {
    // get the user
    User.findOne({ email: req.body.email }, function (err, usr) {
      if (err) {
        return next(err);
      }
      if (!usr) {
        var msg = 'Email not found.'
        req.flash('error', msg);
        return res.redirect('/password/forgot');
      }
      // Create a token UserToken
      UserToken.new(usr._id, function (err, token) {
        // build the reset url:
        // http://localhost:3000/password/forgot/12345TOKEN
        var resetUrl = req.protocol + '://' + req.host + '/forgot-password/' + token.token;
        // Create the template vars 
        var locals = {
            email: usr.email
          , subject: 'Forgot Password'
          , text: resetUrl
        };
        sendMail(locals, function (err, respMs) {
          // TODO add success message.
          // redirect to password_rest success page.
          req.flash('success', 'Check your Email to reset password')
          return res.redirect('/');
        });
      });
    });      
  }
};

/*
* POST /password/forgot/<token>
* checks token, logs in user and redirects him to password reset page
*
*/

function passwordForgotCheck (req, res, next) {
  // Check for a UserToken using the supplied token.
  UserToken.findOne({token: req.params.token}, function (err, token) {
    if (err) return next(err);
    if (!token) {
      req.flash('error', 'Invalid Token. Try Again.');
      return res.redirect('/password/forgot');
    }
    // get the user
    // console.log('token : ', token.userId)
    User.findOne({ _id: token.userId }, function (err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', 'User Not Found. Try Again.');
        return res.redirect('/password/forgot');
      }
      console.log('inside passwordForgotCheck UserToken', user)
      // log the user in
      req.logIn(user, function (err) {
        if (err) return next(err);
        // redirect the user to a password reset form
        // remove all tokens of the user
        UserToken.remove({ userId: token.userId }).exec();
        return res.redirect('/account/password');
      });
    });
  });
};

function verifyEmail(req, res, next) {
  User.findById(req.params.id, function (err, user) {
    user.status = 'verified';
    user.save(function (err, saved) {
      if (saved) req.flash('success', 'Your email has been verified.');
      res.redirect('/login');
    });
  });
};

module.exports = {
    loginPage: loginPage
  , registerPage: registerPage
  , passwordForgotPage: passwordForgotPage
  , logout: logout
  , passwordForgot: passwordForgot
  , passwordForgotCheck: passwordForgotCheck
  , verifyEmail: verifyEmail
};