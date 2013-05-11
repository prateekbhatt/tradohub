'use strict';

exports.index = function (req, res) {
  res.render('index',
    { success: req.flash('success'), error: req.flash('error') });
};

exports.about = function (req, res) {
  res.render('pages/about',
    { success: req.flash('success'), error: req.flash('error') });
};

exports.pages = function (req, res) {
  var page = req.params.page;
  res.render('pages/'+page,
    { success: req.flash('success'), error: req.flash('error') });
};