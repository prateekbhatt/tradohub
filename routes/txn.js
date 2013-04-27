'use strict';

var Product = require('../models/Product')
  , Txn = require('../models/Txn')
  , termsData = require('../helpers/termsData')
  , countryList = require('../helpers/countryList')
  ;

// Renders the request for quote page

function quotePage (req, res, next) {
  Product.find({}, function (err, products) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.products = products;
        res.locals.paymentTerms = termsData.paymentTerms;
        res.locals.shippingTerms = termsData.shippingTerms;
        res.locals.originCountries = termsData.originCountries;
        res.locals.countryList = countryList;
        res.locals.reqDue = termsData.reqDue;
        res.render('partials/quote', { error: req.flash('error'), success: req.flash('success') });
      },
      json: function(){ res.json('Make a request for quote by opening this page on your browser.')}
    });
  })
};

function get (req, res, next) {
  var uid = req.user._id
    , tid = req.params.txnId
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      return res.format({
        html: function(){
          res.locals.txn = txn;
          res.render('partials/txn', { error: req.flash('error'), success: req.flash('success') });
        },
        json: function(){ res.json(200, txn); }
      });
    }
    res.format({
      html: function(){ res.render('404'); },
      json: function(){ res.json(404, { error: { message: 'Txn Not Found'}}); }
    });
  });
};

function list (req, res, next) {
  Txn.find({ uid: req.user._id }, function (err, txns) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.txns = txns;
        res.render('partials/txns', { error: req.flash('error'), success: req.flash('success') });
      },
      json: function(){ res.json(200, txns); }
    });
  });
};

function adminGet (req, res, next) {
  Txn.findOne({ tid: req.params.tid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      return res.format({
        html: function(){
          res.locals.txn = txn;
          res.render('partials/admin/txn', { error: req.flash('error'), success: req.flash('success') });
        },
        json: function(){ res.json(200, txn); }
      });
    }
    res.format({
      html: function(){ res.render('404'); },
      json: function(){ res.json(404, { error: { message: 'Txn Not Found'}}); }
    });
  });
};

function adminList (req, res, next) {
  Txn.find({}, function (err, txns) {
    if (err) return next(err);
    res.format({
      html: function(){
        res.locals.txns = txns;
        res.render('partials/admin/txns', { error: req.flash('error'), success: req.flash('success') });
      },
      json: function(){ res.json(200, txns); }
    });
  });
};

function create (req, res, next) {
  // console.log('inside create txn route\n\n')
  // console.log(req.body)
  // console.log(req.user)
  var txn = req.body
    , uid = req.user ? req.user._id : null;
  Txn.create(txn, uid, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      var msg = 'Request For Quote saved.'
      res.format({
        html: function(){
          req.flash('success', msg);
          res.redirect('/orders');
        },
        json: function(){ res.json(200, { success: { message: msg }}); }
      });        
    } else {
      var msg = 'Request For Quote not saved. Check all input fields.'
      res.format({
        html: function(){
          req.flash('error', msg);
          res.redirect('/quote');
        },
        json: function(){ res.json(400, { error: { message: msg }}); }
      });
    }
  });
};

function updateQuote (req, res, next) {
  var tid = req.params.tid
    , proId = req.body.pid
    ;
  Txn.findOne({ tid: tid, 'products.pid': proId }, function (err, txn) {
    findProduct(txn.products, proId, function (product) {
      if (product) {
        product.quote = req.body.quote;
        txn.status = 'quoted';
        txn.save(function(err, isSaved) {
          if (err) return next(err);
          if (isSaved) {
            req.flash('success', 'Quote updated');
          } else {
            req.flash('error', 'Quote not updated. Try again.');              
          }
        });          
      } else {
        req.flash('error', 'Quote not updated. Try again.');
      }
      res.redirect('/admin/orders/'+tid);
    });
  });
};

function findProduct (products, pid, done) {
  for (var i in products) {
    if (products[i].pid == pid) {
      return done(products[i]);
    }
  }
  return done(null);
};

function remove (req, res, next) {
  Txn.findByIdAndRemove(req.params.tid, function(err, isDeleted) {
    if (err) return next(err);
    res.redirect('/admin/orders');      
  });
};

module.exports = {
    quotePage: quotePage
  , get: get
  , list: list
  , adminGet: adminGet
  , adminList: adminList
  , create: create
  , updateQuote: updateQuote
  , remove: remove
};