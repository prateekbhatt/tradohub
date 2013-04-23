'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var ProductListSchema = new Schema({
    pid: { type: Schema.Types.ObjectId, ref: 'Product' }
  , name: { type: String, required: true }
  , specs: { type: String }
  , quantity: { type: Number, required: true }
  , unit: { type: String, required: true }
  , bid: { type: Number }
  , quote: { type: Number }
  , origin: { type: String }
});

var TxnSchema = new Schema({
    tid: { type: String, required: true }
  , uid: { type: Schema.Types.ObjectId, ref: 'User' }
  , products: [ ProductListSchema ]
  , created: { type: Date, default: Date.now }
  , updated: { type: Date, default: Date.now }
  , info: { type: String }
  , status: { type: String, required: true }
  , company: {
      name: { type: String, required: true }
    , street: { type: String }
    , city: { type: String }
    , state: { type: String }
    , country: { type: String, required: true }
    , zip: { type: String }
  }
  , contact: {
      name: {
          first: { type: String, required: true }
        , last: { type: String, required: true }
      }
    , email: { type: String, required: true }
    , phone: {
        country: { type: Number }
      , area: { type: Number }
      , number: { type: Number }
    }      
  }
  , shipping: {
      destPort: { type: String, required: true }
    , reqDue: { type: Date, required: true }
    , terms: { type: String, required: true }
  }
  , payment: {
      bank: { type: String }
    , acc: { type: Number }
    , terms: { type: String }
  }
  , files: {
      reg: { type: String }
    , imex: { type: String }
    , inv: { type: String }
  }
});

function generateTid () {
  var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG",
                    "SEP", "OCT", "NOV", "DEC"]
    , chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    , date = new Date()
    , tid = date.getFullYear() + monthNames[date.getMonth()] + date.getDate();
  for ( var x = 0; x < 5; x++ ) {
    var i = Math.floor( Math.random() * 35 );
    tid += chars.charAt( i );
  }
  return tid;
};

TxnSchema.statics.create = function create (txn, uid, fn) {
  // console.log('inside create txn model \n\n')
  // console.log(txn)

  var t = new Txn({
      uid: uid
    , status: 'request'
    , info: txn.info
  });
  
  t.tid = generateTid(); // TODO : check if txn id already exists
  
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
    , email: txn.contact.email
    , phone: {
        country: txn.contact.phone.country
      , area: txn.contact.phone.area
      , number: txn.contact.phone.number
    }
  };

  t.shipping = {
      destPort: txn.shipping.destPort
    , reqDue: reqDueTime(txn.shipping.reqDue)
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

  // console.log('create txn')
  // console.log(t)

  t.save(function (err, savedTxn) {
    fn(err, savedTxn);
  });
};

function reqDueTime (days) {
  var today = new Date()
  , reqDate = new Date()
  ;
  reqDate.setDate(today.getDate() + days)
  return reqDate;
};

TxnSchema.statics.update = function update (id, txn, fn) {
  Txn.findById(id, function (err, gotTxn) {
    if (err) { return fn(err); }
    if (gotTxn) {
      gotTxn.name = product.name;
      gotTxn.description = product.description;
      gotTxn.save(function (err, savedTxn) {
        err ? fn(err) : fn(null, savedTxn);
      });
    };
  });
};

var Txn = mongoose.model('Txn', TxnSchema);

module.exports = Txn;