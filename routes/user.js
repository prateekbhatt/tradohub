'use strict';

var User = require('../models/User')
  , UserToken = require('../models/UserToken')
  , countryList = require('../helpers/countryList')
  , mailer = require('../helpers/mailer')
  , config = require('config')
  ;

function create (req, res, next) {

  var u = req.body
    , c = u.company
    , con = u.contact
    ;
  console.log(u)
  var newUser = {
      email: u.email
    , name: {
        first: u.name.first
      , last: u.name.last
    }
    , password: u.password
    , company: {
        name: c.name
      , street: c.street
      , city: c.city
      , state: c.state
      , zip: c.zip
      , industry: c.industry
    }
    , mobile: con.mobile
    , landline: {
        area: con.landline.area
      , no: con.landline.no
    }
    , status: 'notVerified'
  };

  if (u.roles) { newUser.roles = u.roles; }

  User.create(newUser, function (err, usr) {
    if (err) {
      // error is handled inside errorHelper.js given by next
      return next(err);
    }
    if (usr) {
      // send email verification link to user's email
      // Create a token UserToken
      UserToken.new(usr._id, function (err, token) {
        usr.verifyUrl = config.baseUrl + 'forgot-password/' + token.token;
        mailer.sendEmailVerification(usr);
      });

      req.flash('success', 'You have registered successfully. Please verify your email address.');
      return res.redirect('/login');
    }
    req.flash('error', 'An account exists with the given email.');
    res.redirect('/register');
  });
};

function updateAccount (req, res, next) {
  console.log('inside user update route');
  User.findById(req.user._id, function (err, user) {
    if (err) return next(err);
    
    var u = req.body.user
      , c = req.body.company
      ;
    console.log(u)
    user.name = {
        first: u.name.first
      , last: u.name.last
    };
    
    user.company = {
        name: c.name
      , street: c.street
      , city: c.city
      , state: c.state
      , country: c.country
      , zip: c.zip
    };
    user.mobile = u.mobile;
    user.landline = {
        area: u.landline.area
      , no: u.landline.no
    };

    user.save(function (err, updated) {
      if (err) {
        if (err.name == 'ValidationError') {
          return errorHelper(err, function(errors){
            console.log(errors)
            req.flash('error', errors.join(' | '))
            return res.redirect('/account');
          });
        }
        return next(err);
      }
      req.flash('success', 'Account updated successfully.');
      return res.redirect('/account');
    });
  });
};

function accountPage (req, res) {
  res.locals.countryList = countryList;
  res.locals.user = req.user;
  res.render('account/account',
    { error: req.flash('error'), success: req.flash('success') });
};

function passwordPage (req, res) {
  res.render('account/password', 
    {error: req.flash('error'), success: req.flash('success')});
};

function updatePassword (req, res) {
  var userId = req.user._id
    , password = req.body.password
    ;
  User.updatePassword(userId, password, function (err, updated) {
    if (err) console.log(err);
    if (updated) {
      console.log('updated password')
      var msg = 'Password Updated';
      req.flash('success', msg);
      res.redirect('/account/password');
    } else {
      var msg = 'An error occured. Try Again.';
      req.flash('error', msg);
      res.redirect('/account/password');
    }
  });
};

module.exports = {
    create: create
  , updateAccount: updateAccount
  , accountPage: accountPage
  , passwordPage: passwordPage
  , updatePassword: updatePassword
};