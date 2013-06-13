'use strict';

var data = require('../helpers/data')
  , countryList = require('../helpers/countryList')
  , config = require('config')
  , mailer = require('../helpers/mailer')
  ;

exports.index = function (req, res) {
  res.render('index',
    { success: req.flash('success'), error: req.flash('error') });
};

exports.about = function (req, res) {
  res.locals.title = 'Tradohub | About company'
  res.render('pages/about',
    { success: req.flash('success'), error: req.flash('error') });
};

exports.pages = function (req, res) {
  var page = req.params.page
    , title = page.charAt(0).toUpperCase() + page.substr(1).toLowerCase()
    ;
  res.locals.title = 'Tradohub | ' + title;
  res.render('pages/'+ page,
    { success: req.flash('success'), error: req.flash('error') });
};

exports.partnersPage = function (req, res) {
  res.locals.states = data.states;
  res.locals.country = data
  res.locals.industry = data.industry;
  res.locals.countryList = countryList;
  res.locals.title = 'Tradohub | Partner with us and reach the Indian MSME market'
  res.render('pages/partners',
    { success: req.flash('success'), error: req.flash('error') });
};

// relays all messages to admin email
exports.contact = function (req, res) {
  var user = {
        name: {
            first: 'Tradohub'
          , last: 'Admin'
        }
      , email: config.mailer._from
    };
  user.msg = req.body;
  // user.contact = req.body.contact;
  // console.log('inside partners post index');
  // console.log(user);
  mailer.sendAdmin(user);
  req.flash('success', 'Thank you. We will get back to you soon.');
  res.redirect('/');
};