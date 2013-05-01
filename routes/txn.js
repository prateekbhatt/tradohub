'use strict';

var Product = require('../models/Product')
  , Txn = require('../models/Txn')
  , config = require('../config')
  , termsData = require('../helpers/termsData')
  , shippingTerms = termsData.shippingTerms
  , paymentTerms = termsData.paymentTerms
  , originCountries = termsData.originCountries
  , countryList = require('../helpers/countryList')
  , sendMail = require('../helpers/mailer').sendMail
  ;

// Renders the request for quote page

function quotePage (req, res, next) {
  Product.find({}, function (err, products) {
    if (err) return next(err);    
    res.locals.products = products;
    res.locals.paymentTerms = paymentTerms;
    res.locals.shippingTerms = shippingTerms;
    res.locals.originCountries = originCountries;
    res.locals.countryList = countryList;
    res.locals.reqDue = termsData.reqDue;
    res.locals.user = req.user;
    res.render('txns/quote',
      { error: req.flash('error'), success: req.flash('success') });
  });
};

function bankPage (req, res, next) {
  var uid = req.user._id
    , tid = req.params.tid
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      var s = txn.status;
      if (s == 'po') {
        return res.redirect('/orders/'+tid+'/po');
      }
      if (s == 'quote' || s == 'bid') {
        res.locals.txn = txn;
        res.locals.totalValue = txn.getTotalValue();
        return res.render('txns/bank',
          { error: req.flash('error'), success: req.flash('success') });
      }
    }
    res.redirect('/orders/'+tid);
  });
}

function poPage (req, res, next) {
  var uid = req.user._id
    , tid = req.params.tid
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    if (txn) {
      if (txn.status == 'po') {
        res.locals.txn = txn;
        res.locals.totalValue = txn.getTotalValue();
        return res.render('txns/po',
          { error: req.flash('error'), success: req.flash('success') });
      } else {
        req.flash('error', 'You can\'t make a purchase order on this order now.');
        return res.redirect('/orders/'+tid);
      }
    }
    res.render('404');
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
  Txn.find({ uid: req.user._id }, function (err, txns) {
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
  var t = new Txn({
      uid: usr._id
    , status: 'request'
    , info: txn.info
  });
  
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
    , phone: {
        country: txn.contact.phone.country
      , area: txn.contact.phone.area
      , number: txn.contact.phone.number
    }
  };

  t.shipping = {
      destPort: txn.shipping.destPort
    , reqDue: t.reqDueTime(txn.shipping.reqDue)
    , terms: txn.shipping.terms
  };

  t.payment = {
      bank: txn.payment.bank
    , acc: txn.payment.acc
    , terms: txn.payment.terms
  };
  console.log(JSON.parse(txn.products[0].detail))
  t.products = [];
  for (var i in txn.products) {
    var p = txn.products[i]
    var newProduct = {
        pid: JSON.parse(p.detail)['_id']
      , name: JSON.parse(p.detail)['name']
      , unit: JSON.parse(p.detail)['unit']
      , specs: p.specs
      , quantity: p.quantity
      , bid: p.bid
      , quote: p.quote
      , origin: txn.origin
    };
    t.products.push(newProduct);
  };

  t.save(function (err, saved) {
    if (err) return next(err);
    if (saved) {
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

function updateBid (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    , bids = req.body.bids
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (err) return next(err);
    var p = txn.products
    for (var i in p) {
      p[i].bid = bids[p[i].pid];
    }
    txn.status = 'bid';
    txn.bidNo += 1; // tracks the numberof times the user has bid. we limit it to one.
    txn.save(function(err, isSaved) {
      if (err) return next(err);
      if (isSaved) {
        req.flash('success', 'Price change request sent.');
      } else {
        req.flash('error', 'Price not updated. Try again.');              
      }
      var locals = {
          email: config.adminMail
        , subject: 'Negotiation for order: ' + tid
        , text: 'User: '+req.user.email+' has initiated a price change request.'
      };
      sendMail(locals, function (err, respMs) {
        if (err) return next(err);
        console.log('email sending');
      });
      res.redirect('/orders/' + tid);
    });
  });
};

function updatePayInfo (req, res,  next) {
  var tid = req.params.tid
    , uid = req.user._id
    , b = req.body.bank
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, t) {
    if (err) return next(err);
    t.status = 'po';
    t.payment.bank = b.name;
    t.payment.address = b.address;
    t.payment.accName = b.accName;
    t.payment.accNo = b.accNo;
    t.payment.bankCode = b.bankCode;
    t.save(function (err, saved) {
      if (err) return next(err);
      req.flash('success', 'Payment Info updated.');
      res.redirect('/orders/'+tid+'/po');
    });
  });
};

function cancel (req, res, next) {
  var tid = req.params.tid
    , uid = req.user._id
    ;
  Txn.findOne({ tid: tid, uid: uid }, function (err, txn) {
    if (txn.status != 'po' || txn.status != 'invoice') {
      txn.status = 'cancel';
      txn.save(function (err, cancelled) {
        if (err) return next(err);
        if (cancelled) {
          req.flash('success', 'Order cancelled.')
        }
        res.redirect('/orders');
      });      
    } else {
      req.flash('error', 'You can\'t cancel the order after purchase order has been made.');
      res.redirect('/orders/'+tid);
    }
  });
};

module.exports = {
    quotePage: quotePage
  , bankPage: bankPage
  , poPage: poPage
  , get: get
  , list: list
  , create: create
  , updateBid: updateBid
  , updatePayInfo: updatePayInfo
  , cancel: cancel
};