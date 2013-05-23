'use strict';

var User = require('../models/User')
  , UserToken = require('../models/UserToken')
  , countryList = require('../helpers/countryList')
  , mailer = require('../helpers/mailer')
  , config = require('config')
  , data = require('../helpers/data')
  ;

function loginPage (req, res) {
  res.render('auth/login', { error: req.flash('error'), success: req.flash('success') });    
};

function registerPage (req, res) {
  res.locals.states = data.states;
  res.locals.industry = data.industry;
  res.render('auth/register', { error: req.flash('error') });
};

function passwordForgotPage (req, res) {
  res.render('auth/forgot', { error: req.flash('error') });
};

function accountPage (req, res) {
  res.locals.user = req.user;
  res.locals.states = data.states;
  res.render('account/account',
    { error: req.flash('error'), success: req.flash('success') });
};

function passwordPage (req, res) {
  res.render('account/password', 
    {error: req.flash('error'), success: req.flash('success')});
};

function logout (req, res) {
  req.logout();
  req.flash('success', 'You have been logged out.')
  res.redirect('/');
};

function create (req, res, next) {

  var u = req.body
    , c = u.company
    , con = u.contact
    ;
  // console.log(u)
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
        usr.linkUrl = config.baseUrl + 'verify-email/' + token.token;
        mailer.sendEmailVerification(usr);
      });

      req.flash('success', 'You have registered successfully. Please verify your email address.');
      return res.redirect('/login');
    }
    req.flash('error', 'An account exists with the given email.');
    res.redirect('/register');
  });
};

function verifyEmail(req, res, next) {
  var token = req.params.token
    ;
  // Check for a UserToken using the supplied token.
  UserToken.findOne({token: token}, function (err, token) {
    if (err) return next(err);
    if (!token) {
      req.flash('error', 'Invalid Token. Try Again.');
      return res.redirect('/register');
    }
    // get the user
    User.findById(token.uid, function (err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', 'User Not Found. Try Again.');
        return res.redirect('/register');
      }
      user.status = 'verified';
      user.save(function (err, saved) {
        if (err) return next(err);
        if (saved) {
          var msg = 'Your email has been verified. \
            You may login now to update your phone and company details. \
            We will activate your account within a day, after verifying your \
            phone and company details. You will be able to request quotes and \
            make orders after account activation.';

          req.flash('success', msg);

          // remove all tokens of the user
          UserToken.remove({ uid: token.uid }).exec();

          // send email verified email
          user.msg = msg;
          user.linkUrl = config.baseUrl + 'login';
          mailer.sendEmailVerified(user)

          return res.redirect('/login');
        }
      });
    });
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
      , country: 'IND'
      , zip: c.zip
    };
    user.mobile = u.mobile;
    user.landline = {
        area: u.landline.area
      , no: u.landline.no
    };

    user.save(function (err, updated) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Account updated successfully.');
      return res.redirect('/account');
    });
  });
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
        var msg = 'There is no account with this email.'
        req.flash('error', msg);
        return res.redirect('/password/forgot');
      }
      // Create a token UserToken
      UserToken.new(usr._id, function (err, token) {
        // build the reset url:
        // http://localhost:3000/password/forgot/12345TOKEN
        usr.resetUrl = config.baseUrl + 'forgot-password/' + token.token;
        
        mailer.sendForgotPassword(usr);
          // redirect to password_rest success page.
        req.flash('success', 'Check your Email to reset password')
        return res.redirect('/');
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
      return res.redirect('/forgot-password');
    }
    // get the user
    User.findOne({ _id: token.uid }, function (err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', 'User Not Found. Try Again.');
        return res.redirect('/forgot-password');
      }
      console.log('inside passwordForgotCheck UserToken', user)
      // log the user in
      req.logIn(user, function (err) {
        if (err) return next(err);
        // redirect the user to a password reset form
        // remove all tokens of the user
        UserToken.remove({ uid: token.uid }).exec();
        return res.redirect('/account/password');
      });
    });
  });
};

module.exports = {
    loginPage: loginPage
  , registerPage: registerPage
  , passwordForgotPage: passwordForgotPage
  , accountPage: accountPage
  , passwordPage: passwordPage
  , logout: logout
  , create: create
  , verifyEmail: verifyEmail
  , updateAccount: updateAccount
  , updatePassword: updatePassword
  , passwordForgot: passwordForgot
  , passwordForgotCheck: passwordForgotCheck
};