'use strict';

var Category = require('../models/Category');

module.exports = function loadCategories (req, res, next) {
  Category.find({}).populate('products').exec(function (err, c) {
    res.locals.category = c;
    next();
  });
}