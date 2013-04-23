'use strict';

var User = require('../models/User')
  , File = require('../models/File')
  , errorHelper = require('../helpers/errorHelper')
  , fileValidate = require('../helpers/fileValidate')
  , countryList = require('../helpers/countryList')
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
    , status: 'notVerified'
  };

  if (u.roles) { newUser.roles = u.roles; }

  User.create(newUser, function (err, userCreated) {
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
    if (userCreated) {
      File.create(file.path, fileType, fileExt, function (err, saved) {
        console.log(err);
        if (saved) {
          console.log(saved);
          userCreated.updateImex(saved._id, function (err, updated) {
            console.log('imex updated!\n\n')
            console.log(err, updated);
          });
        }
      });
      req.flash('success', 'You have registered successfully.');
      return res.redirect('/login');
    }
    req.flash('error', 'User with same email already exists.');
    res.redirect('/register');
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

module.exports = {
    create: create
  , accountPage: accountPage
  , passwordPage: passwordPage
  , updatePassword: updatePassword
};