'use strict';

var User = require('../models/User')
  , File = require('../models/File')
  , UserToken = require('../models/UserToken')
  , errorHelper = require('../helpers/errorHelper')
  , fileValidate = require('../helpers/fileValidate')
  , countryList = require('../helpers/countryList')
  , sendMail = require('../helpers/mailer').sendMail
  ;

function create (req, res, next) {

  console.log('inside user create route');
  console.log(req.files)  
  var file = req.files.imexFile
    , fileType = 'imex'
    , fileExt = fileValidate(req.files.imexFile.name)
    ;
  if (!file.size || !fileExt) {
    req.flash('error', 'Please upload Import / Export Document in pdf/doc/docx/jpg/png formats');
    return res.redirect('/register');
  }
  console.log('fileExt: ',fileExt);  

  var u = req.body
    , c = u.company
    , p = u.phone
    ;
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
      , country: c.country
      , zip: c.zip
      , imex: c.imex
    }
    , phone: {
        country: p.country
      , area: p.area
      , number: p.number
    }  
    , status: 'notVerified'
  };

  if (u.roles) { newUser.roles = u.roles; }

  User.create(newUser, function (err, usr) {
    if (err) {
      if (err.name == 'ValidationError') {
        return errorHelper(err, function(errors){
          console.log(errors)
          req.flash('error', errors.join(' | '))
          return res.redirect('/register')            
        });
      }
      return next(err);
    }
    if (usr) {
      // Create a token UserToken
      UserToken.new(usr._id, function (err, token) {
        var verifyUrl = req.protocol + '://' + req.host + '/forgot-password/' + token.token;
        // Create the template vars 
        var locals = {
            email: usr.email
          , subject: 'Confirm your email address'
          , text: verifyUrl
        };
        sendMail(locals, function (err, respMs) {
          console.log('email sending')
        });
      });
      File.create(file.path, fileType, fileExt, function (err, saved) {
        console.log(err);
        if (saved) {
          console.log(saved);
          usr.updateImex(saved._id, function (err, updated) {
            console.log('imex updated!\n\n')
            console.log(err, updated);
          });
        }
      });
      req.flash('success', 'You have registered successfully. Please verify your email address.');
      return res.redirect('/login');
    }
    req.flash('error', 'User with same email already exists.');
    res.redirect('/register');
  });
};

function updateAccount (req, res, next) {
  console.log('inside user update route');
  User.findById(req.user._id, function (err, user) {
    if (err) return next(err);
    
    var u = req.body.user
      , c = u.company
      , p = u.phone
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
    
    user.phone = {
        country: p.country
      , area: p.area
      , number: p.number
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
  res.render('partials/account/account',
    { error: req.flash('error'), success: req.flash('success') });
};

function passwordPage (req, res) {
  res.render('partials/account/password', 
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

function updateStatus (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    user.status = req.params.status;
    user.save(function (err, saved) {
      var msg = 'Your account has been ' + saved.status + '.';
      var locals = {
          email: saved.email
        , subject: 'Tradohub account update'
        , text: msg
      };
      sendMail(locals, function (err, respMs) {
        console.log('email sent')
      });
      if (saved) req.flash('success', 'User: ' + saved.email + ' status updated to ' + saved.status);
      res.redirect('/admin/users');
    });
  });
};

function adminList (req, res, next) {
  User.find({}, function (err, users) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.users = users;
        res.render('partials/admin/users',
          { error: req.flash('error'), success: req.flash('success') });
      },
      json: function(){ res.json(200, users); }
    });
  });
};

function adminGet (req, res, next) {
  User.findById(req.aprams.id, function (err, user) {
    if (err) return next(err);
    if (user) {
      return res.format({
        html: function(){
          res.locals.user = user;
          res.render('partials/admin/user',
            { error: req.flash('error'), success: req.flash('success') });
        },
        json: function(){ res.json(200, user); }
      });
    }
    res.format({
      html: function(){ res.render('404'); },
      json: function(){ res.json(404, { error: { message: 'User Not Found' }}); }
    });
  });
};

module.exports = {
    create: create
  , updateAccount: updateAccount
  , accountPage: accountPage
  , passwordPage: passwordPage
  , updatePassword: updatePassword
  , updateStatus: updateStatus
  , adminList: adminList
  , adminGet: adminGet
};