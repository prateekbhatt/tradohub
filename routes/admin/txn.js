'use strict';

var Product = require('../../models/Product')
  , Txn = require('../../models/Txn')
  , termsData = require('../../helpers/termsData')
  , shippingTerms = termsData.shippingTerms
  , paymentTerms = termsData.paymentTerms
  , originCountries = termsData.originCountries
  , countryList = require('../../helpers/countryList')
  , sendMail = require('../../helpers/mailer').sendMail
  ;

function get (req, res, next) {
  Txn.findOne({ tid: req.params.tid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      res.locals.txn = txn;
      res.locals.shippingTerms = shippingTerms;
      res.locals.paymentTerms = paymentTerms;
      return res.render('admin/txn',
        { error: req.flash('error'), success: req.flash('success') });
    }
    res.render('404');
  });
};

function list (req, res, next) {
  Txn.find({}, function (err, txns) {
    if (err) return next(err);
    res.locals.txns = txns;
    res.render('admin/txns',
      { error: req.flash('error'), success: req.flash('success') });
  });
};

function updateQuote (req, res, next) {
  var tid = req.params.tid
    , pid = req.params.pid
    , uid = req.user._id
    ;
  Txn.findOne({ tid: tid, uid: uid, 'products.pid': pid }, function (err, txn) {
    if (err) return next(err);
    txn.getProductByPid(pid, function (err, product) {
      if (product) {
        product.quote = req.body.quote;
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

function updateShippingTerms (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    , terms = req.body.shippingTerms
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    txn.shipping.terms = terms;
    txn.save(function (err, saved) {
      if (err) return next(err)
      if (saved) req.flash('success', 'Shipping Terms updated.');
      res.redirect('/admin/orders/' + tid);      
    });
  });
};

function updatePaymentTerms (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    , terms = req.body.paymentTerms
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    txn.payment.terms = terms;
    txn.save(function (err, saved) {
      if (err) return next(err)
      if (saved) req.flash('success', 'Payment Terms updated.');
      res.redirect('/admin/orders/' + tid);      
    });
  });
};

function sendQuote (req, res, next) {
  var tid = req.params.tid
    ;
  Txn.findOne({ tid: tid }, function (err, t) {
    if (err) return next(err);
    var quoteUrl = 'http://tradohub.com/orders/' + tid;
    var locals = {
        email: t.contact.email
      , subject: 'Quote for your order: ' + tid
      , text: quoteUrl
    };
    sendMail(locals, function (err, respMs) {
      if (err) return next(err);
      console.log('email sending')
      req.flash('success', 'Quote sent to user.');
      res.redirect('/admin/orders/' + tid);
    });
  });
};

function remove (req, res, next) {
  Txn.findByIdAndRemove(req.params.tid, function(err, isDeleted) {
    if (err) return next(err);
    res.redirect('/admin/orders');      
  });
};

module.exports = {
    get: get
  , list: list
  , updateQuote: updateQuote
  , updateShippingTerms: updateShippingTerms
  , updatePaymentTerms: updatePaymentTerms
  , sendQuote: sendQuote
  , remove: remove
};