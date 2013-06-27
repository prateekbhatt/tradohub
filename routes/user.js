'use strict';

var passport = require('passport')
  , async = require('async')
  , User = require('../models/User')
  , UserToken = require('../models/UserToken')
  , countryList = require('../helpers/countryList')
  , mailer = require('../helpers/mailer')
  , config = require('config')
  , data = require('../helpers/data')
  , getExpressErrors = require('../helpers/getExpressErrors')
  ;

function getLogin (req, res) {
  res.locals.title = 'Tradohub | Log into your account';
  res.render('users/login', { error: req.flash('error'), success: req.flash('success') });    
};

function postLogin (req, res, next){

  var currentUser;
  async.series(
    [
      // authenticate user
      function (cb){
        passport.authenticate('local', function (err, user, info){
          if (err) return cb(err);
          currentUser = user;
          cb();
        })(req, res, next);
      },

      // check if authenticated
      function (cb){
        if (!currentUser) {
          cb(new Error('Authentication failed.'));
        } else {
          cb();
        }
      },
      
      // login user
      function (cb){
        req.logIn(currentUser, function (err){
          if (err) return cb(err);
          cb();
        })
      }

    ],

    function (err, result){
      if (err) {

        req.flash('error', 'Invalid email or password');
        res.redirect('/login');      
      } else {

        var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/quote';
        // redirecTo set in loggedIn middleware
        delete req.session.redirectTo; 
        res.redirect(redirectTo);
      }
    }
  );
};

function getRegister (req, res) {
  res.locals.states = data.states;
  res.locals.industry = data.industry;
  res.locals.title = 'Tradohub | Create a new account';
  res.render('users/register', { error: req.flash('error') });
};

function postRegister (req, res, next) {

  var u = req.body
    , c = u.company
    , con = u.contact
    , password = req.body.password
    ;
  // console.log(password, '\n')

  req.assert('password', 'Password should be between 8 to 20 characters').len(8, 20);
  var errors =  getExpressErrors(req);
  if (errors) {
    req.flash('error', errors);
    return res.redirect(req.path);
  }

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

  // if (u.roles) { newUser.roles = u.roles; } // admin roles to be assigned later by super admin

  User.create(newUser, function (err, usr) {
    // error is handled inside errorHelper.js given by next
    if (err) return next(err);
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

function getAccount (req, res) {
  res.locals.user = req.user;
  res.locals.states = data.states;
  res.render('users/account',
    { error: req.flash('error'), success: req.flash('success') });
};

function postAccount (req, res, next) {
  User.findById(req.user._id, function (err, user) {
    if (err) return next(err);
    
    var u = req.body.user
      , c = req.body.company
      ;
      
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

function getAccountPassword (req, res) {
  res.render('users/password', 
    {error: req.flash('error'), success: req.flash('success')});
};

function postAccountPassword (req, res, next) {
  var uid = req.user._id
    , password = req.body.password
    , currentUser
    ;

  async.series([

      // password validation
      function (cb){
        req.assert('password', 'Password should be between 8 to 20 characters').len(8, 20);
        var err =  getExpressErrors(req);
        if (err) {
          req.flash('error', err);
          cb(err);
        } else {
          cb();
        }
      },

      // get user
      function (cb){
        User.findById(uid, function (err, u){
          if (err) return cb(err);
          currentUser = u;
          cb();
        });
      },

      // update password
      function (cb){
        currentUser.password = password;
        currentUser.save(function (err, updated){
          if (err) return cb(err);
          cb();
        })
      }
    ],

    function (err, result){

      if (err) {
        res.redirect('/account/password');
      } else {
        req.flash('success', 'Password Updated');
        res.redirect('/account');
      }
    }
  );
};

function getPasswordForgot (req, res) {
  res.render('users/forgot', { error: req.flash('error') });
};

/*
* POST /password/forgot
*/

function postPasswordForgot (req, res, next) {

  var email = req.body.email;

  req.onValidationError(function (msg) {
    //Redirect to `/password/forgot` if email is bogus
    req.flash('error', msg);
    res.redirect('/password/forgot');
  });
  req.check('email', 'Please enter a valid email').len(1).isEmail();

  if (!req.validationErrors()) {
    // get the user
    User.findOne({ email: email }, function (err, usr) {
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

function getPasswordForgotToken (req, res, next) {
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
      console.log('inside getPasswordForgotCheck UserToken', user)
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

function getVerifyEmail(req, res, next) {
  var token = req.params.token;

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
          mailer.sendEmailVerified(user);

          return res.redirect('/login');
        }
      });
    });
  });
};

function getLogout (req, res) {
  req.logout();
  req.flash('success', 'You have been logged out.')
  res.redirect('/');
};


module.exports = {
    getLogin: getLogin
  , postLogin: postLogin

  , getRegister: getRegister
  , postRegister: postRegister

  , getAccount: getAccount
  , postAccount: postAccount
  
  , getAccountPassword: getAccountPassword
  , postAccountPassword: postAccountPassword
  
  , getPasswordForgot: getPasswordForgot
  , postPasswordForgot: postPasswordForgot
  , getPasswordForgotToken: getPasswordForgotToken

  , getVerifyEmail: getVerifyEmail

  , getLogout: getLogout
};