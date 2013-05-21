'use strict';

var Product = require('../models/Product')
  , Txn = require('../models/Txn')
  , config = require('config')
  , termsData = require('../helpers/termsData')
  , countryList = require('../helpers/countryList')
  , sendMail = require('../helpers/mailer').sendMail
  ;

// Renders the request for quote page

function quotePage (req, res, next) {
  Product.find({}, function (err, products) {
    if (err) return next(err);
    res.locals.products = products;
    res.locals.paymentTerms = termsData.paymentTerms;
    res.locals.countryList = countryList;
    res.locals.reqDue = termsData.reqDue;
    res.locals.user = req.user;
    res.render('txns/quote',
      { error: req.flash('error'), success: req.flash('success') });
  });
};

// function bankPage (req, res, next) {
//   var uid = req.user._id
//     , tid = req.params.tid
//     ;
//   Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
//     if (err) return next(err);
//     if (txn) {
//       var s = txn.status;
//       if (s == 'ordered') {
//         return res.redirect('/orders/'+tid+'/po');
//       } else if (s == 'quoted') {
//         res.locals.txn = txn;
//         res.locals.totalValue = txn.getTotalValue();
//         return res.render('txns/bank',
//           { error: req.flash('error'), success: req.flash('success') });
//       }
//     }
//     res.redirect('/orders/'+tid);
//   });
// };

function invoicePage (req, res, next) {
  var uid = req.user._id
    , tid = req.params.tid
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      if (txn.status == 'requested'){
        req.flash('error', 'Please wait till you receive price quote.');
        return res.redirect('/orders/'+tid);
      } else if (txn.status == 'quoted'){
        req.flash('error', 'Please confirm your order.');
        return res.redirect('/orders/'+tid);
      } else {
        res.locals.txn = txn;
        res.locals.bank = termsData.tradohubBank;
        res.locals.totalValue = txn.getTotalValue();
        return res.render('txns/invoice',
          { error: req.flash('error'), success: req.flash('success') });
      }
    } else {
      res.render('404');      
    }
  });
};

function get (req, res, next) {
  var uid = req.user._id
    , tid = req.params.tid
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {      
      res.locals.txn = txn;
      return res.render('txns/get',
        { error: req.flash('error'), success: req.flash('success') });        
    }
    res.render('404');
  });
};

function list (req, res, next) {
  Txn.find({ uid: req.user._id }).sort({'created' : -1}).exec(function (err, txns) {
    if (err) return next(err);
    res.locals.txns = txns;
    res.render('txns/list',
      { error: req.flash('error'), success: req.flash('success') });
  });
};

function create (req, res, next) {
  var txn = req.body
    , usr = req.user
    ;

  console.log('txn body \n\n')
  console.log(txn)

  var t = new Txn({
      uid: usr._id
    , status: 'requested'
    , info: txn.info
  });
  
  t.reqDue = t.reqDueTime(txn.reqDue);
  t.payMode = txn.payMode;
  
  t.tid = t.generateTid(); // TODO : check if txn id already exists
  
  t.company = {
      name: txn.company.name
    , street: txn.company.street
    , city: txn.company.city
    , state: txn.company.state
    , country: txn.company.country
    , zip: txn.company.zip
  };

  t.contact = {
      name: {
          first: txn.contact.name.first
        , last: txn.contact.name.last
      }  
    , email: usr.email
    , mobile: txn.contact.mobile
    , landline: {
        area: txn.contact.landline.area
      , no: txn.contact.landline.no
    }
  };

  console.log(JSON.parse(txn.products[0].detail))
  
  t.products = [];
  
  for (var i in txn.products) {
    var p = txn.products[i]
    var newProduct = {
        pid: JSON.parse(p.detail)['_id']
      , name: JSON.parse(p.detail)['name']
      , specs: p.specs
      , quantity: p.quantity
      , unit: JSON.parse(p.detail)['unit']
      , quote: p.quote
    };
    t.products.push(newProduct);
  };

  console.log('\nfull txn object\n\n')
  console.log(t)

  t.save(function (err, saved) {
    if (err) return next(err);
    if (saved) {
      var msg = 'Request For Quote saved.'
      req.flash('success', msg);
      res.redirect('/orders');
    } else {
      var msg = 'Request For Quote not saved. Check all input fields.'
      req.flash('error', msg);
      res.redirect('/quote');
    }
  });
};

function updateBank (req, res,  next) {
  var tid = req.params.tid
    , uid = req.user._id
    , b = req.body.bank
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, t) {
    if (err) return next(err);
    t.status = 'ordered';
    t.bank.name = b.name;
    t.bank.accNo = b.accNo;
    t.bank.accName = b.accName;
    t.save(function (err, saved) {
      if (err) return next(err);
      req.flash('success', 'Bank Info recieved and order confirmed.');
      res.redirect('/orders/'+tid+'/po');
    });
  });
};

function cancel (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (txn.status == 'quoted' || txn.status == 'requested') {
      txn.status = 'cancelled';
      txn.save(function (err, cancelled) {
        if (err) return next(err);
        if (cancelled) {
          req.flash('success', 'Order cancelled.')
        }
        res.redirect('/orders');
      });      
    } else {
      req.flash('error', 'You can\'t cancel after you confirmed the order.');
      res.redirect('/orders/'+tid);
    }
  });
};

function confirm (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (txn.status == 'quoted') {
      txn.status = 'ordered';
      txn.save(function (err, ordered) {
        if (err) return next(err);
        if (ordered) {
          req.flash('success', 'Order confirmed.')
        }
        res.redirect('/orders/'+tid);
      });      
    } else if (txn.status == 'requested'){
      req.flash('error', 'Please wait for our price quote.');
      res.redirect('/orders/'+tid);
    } else {
      req.flash('error', 'The order is already confirmed.');
      res.redirect('/orders/'+tid);
    }
  });
};

module.exports = {
    quotePage: quotePage
  // , bankPage: bankPage
  , invoicePage: invoicePage
  , get: get
  , list: list
  , create: create
  , updateBank: updateBank
  , cancel: cancel
  , confirm: confirm
};