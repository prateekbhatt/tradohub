'use strict';

var Product = require('../../models/Product')
  , Txn = require('../../models/Txn')
  , termsData = require('../../helpers/termsData')
  , paymentTerms = termsData.paymentTerms
  , countryList = require('../../helpers/countryList')
  , mailer = require('../../helpers/mailer')
  , config = require('config')
  ;

function get (req, res, next) {
  Txn.findOne({ tid: req.params.tid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      res.locals.txn = txn;
      res.locals.paymentTerms = paymentTerms;
      return res.render('admin/txn',
        { error: req.flash('error'), success: req.flash('success') });
    }
    res.render('404');
  });
};

function list (req, res, next) {
  Txn.find({}).sort({ 'created': -1 }).exec(function (err, txns) {
    if (err) return next(err);
    res.locals.txns = txns;
    res.render('admin/txns',
      { error: req.flash('error'), success: req.flash('success') });
  });
};

function updateQuote (req, res, next) {
  var tid = req.params.tid
    , pid = req.params.pid
    ;
  Txn.findOne({ tid: tid, 'products.pid': pid }, function (err, txn) {
    if (err) return next(err);
    txn.getProductByPid(pid, function (err, product) {
      if (product) {
        product.quote = req.body.quote;
        product.quoted = new Date();
        txn.status = 'quoted';
        txn.save(function(err, isSaved) {
          if (err) return next(err);
          if (isSaved) {
            console.log('saved')
            req.flash('success', 'Quote updated');
            return res.redirect('/admin/orders/'+tid);
          } else {
            req.flash('error', 'Quote not updated. Try again.');   
            return res.redirect('/admin/orders/'+tid);           
          }
        });          
      } else {
        req.flash('error', 'Quote not updated. Try again.');
        return res.redirect('/admin/orders/'+tid);
      }
    });
  });
};

// function updateShippingTerms (req, res, next) {
//   var tid = req.params.tid
//     , uid = req.user._id
//     , terms = req.body.shippingTerms
//     ;
//   Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
//     if (err) return next(err);
//     txn.shipping.terms = terms;
//     txn.save(function (err, saved) {
//       if (err) return next(err)
//       if (saved) req.flash('success', 'Shipping Terms updated.');
//       res.redirect('/admin/orders/' + tid);      
//     });
//   });
// };

// function updatePaymentTerms (req, res, next) {
//   var tid = req.params.tid
//     , uid = req.user._id
//     , terms = req.body.paymentTerms
//     ;
//   Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
//     if (err) return next(err);
//     txn.payment.terms = terms;
//     txn.save(function (err, saved) {
//       if (err) return next(err)
//       if (saved) req.flash('success', 'Payment Terms updated.');
//       res.redirect('/admin/orders/' + tid);      
//     });
//   });
// };

function updateStatus (req, res, next) {
  var tid = req.params.tid
    , statusTypes = {
        'cancel': 'cancelled'
      , 'paid': 'paid'
    }
    , status = statusTypes[req.params.status]
    ;
  Txn.findOne({ tid: tid }, function (err, txn) {
    var s = txn.status;
    if (status == 'paid') {
      if (s == 'ordered') {
        txn.status = status;
      } 
      txn.save(function (err, updated) {
        if (err) return next(err);
        if (updated) {
          req.flash('success', 'Status updated.')
        }
        return res.redirect('/admin/orders/'+tid);
      });      
    } else {
      req.flash('error', 'Your action could not be performed. Try again.');
      res.redirect('/admin/orders/'+tid);
    }
  });
};

function sendQuote (req, res, next) {
  var tid = req.params.tid
    ;
  Txn.findOne({ tid: tid }).populate('uid').exec(function (err, t) {
    if (err) return next(err);
    var usr = t.uid;
    usr.quoteUrl = config.baseUrl + 'orders/' + tid;
    usr.tid = tid;
    mailer.sendQuote(usr);
    req.flash('success', 'Quote sent to user.');
    res.redirect('/admin/orders/' + tid);
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
  // , updateShippingTerms: updateShippingTerms
  // , updatePaymentTerms: updatePaymentTerms
  , updateStatus: updateStatus
  , sendQuote: sendQuote
  , remove: remove
};