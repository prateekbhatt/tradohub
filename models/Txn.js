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

// Txn status types
var statusTypes = ['request', 'quote', 'bid', 'po', 'invoice', 'cancel'];

var TxnSchema = new Schema({
    tid: { type: String, required: true }
  , uid: { type: Schema.Types.ObjectId, ref: 'User' }
  , products: [ ProductListSchema ]
  , created: { type: Date, default: Date.now }
  , updated: { type: Date, default: Date.now }
  , info: { type: String }
  , bidNo: { type: Number, default: 0 }
  , status: { type: String, required: true, enum: statusTypes }
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
    , address: { type: String }
    , accName: { type: String }
    , accNo: { type: Number }
    , bankCode: { type: String }
    , terms: { type: String }
  }
  , files: {
      reg: { type: String }
    , imex: { type: String }
    , inv: { type: String }
  }
});

TxnSchema.methods.generateTid = function generateTid () {
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

TxnSchema.methods.reqDueTime = function reqDueTime (days) {
  var reqDate = new Date();
  reqDate.setDate(reqDate.getDate() + days)
  return reqDate;
};

TxnSchema.methods.getProductByPid = function getProductByPid (pid, fn) {
  var p = this.products;
  for (var i in p) {
    if (p[i].pid == pid) {
      return fn(null, p[i]);
    }
  }
  return fn(null, null);
};

TxnSchema.methods.getTotalValue = function getTotalValue () {
  var totalValue = 0
    , p = this.products
    ;
  for (var i in p) {
    if (p[i].quantity) {
      totalValue += p[i].quantity*p[i].quote;
      console.log(i, p[i].quantity, p[i].quote, totalValue)      
    }
  }
  return totalValue;
};

var Txn = mongoose.model('Txn', TxnSchema);

module.exports = Txn;