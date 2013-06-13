'use strict';

var User = require('../../models/User')
  , mailer = require('../../helpers/mailer')
  , config = require('config')
  ;

function updateStatus (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    user.status = req.params.status;
    user.save(function (err, saved) {
      if (saved) {
        var s = saved.status;
        if (s == 'activated') {
          saved.linkUrl = config.baseUrl + 'login';
          saved.linkName = 'Log in to your Tradohub Account'
        }
        mailer.sendAccountStatus(saved);
        req.flash('success', 'User: ' + saved.email + ' status updated to ' + saved.status);
      }
      res.redirect('/admin/users');
    });
  });
};

function list (req, res, next) {
  User.find({}, function (err, users) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.users = users;
        res.render('admin/users',
          { error: req.flash('error'), success: req.flash('success') });
      },
      json: function(){ res.json(200, users); }
    });
  });
};

function get (req, res, next) {
  User.findById(req.aprams.id, function (err, user) {
    if (err) return next(err);
    if (user) {
      return res.format({
        html: function(){
          res.locals.user = user;
          res.render('admin/user',
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

function invitePage (req, res, next) {
  res.render('admin/invite',
    { error: req.flash('error'), success: req.flash('success') });
};

function sendInvite (req, res, next) {
  var user = {}
    , email = req.body.email
    , company = req.body.company
    ;
  user.email = email;
  user.company = company;
  user.title = 'Buy raw materials from reputed manufacturers at low price' ;
  if (user.email) {
    mailer.sendInvite(user);
    req.flash('success', 'Sending mail invitation.');    
  } else {
    req.flash('error', 'Failed. Try Again.');
  }
  res.redirect('/admin/invite');
};



module.exports = {
    get: get
  , list: list
  , updateStatus: updateStatus
  , invitePage: invitePage
  , sendInvite: sendInvite
};