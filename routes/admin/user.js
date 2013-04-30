'use strict';

var User = require('../../models/User')
  , sendMail = require('../../helpers/mailer').sendMail
  ;

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

function list (req, res, next) {
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

function get (req, res, next) {
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
    get: get
  , list: list
  , updateStatus: updateStatus
};