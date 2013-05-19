'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , troop = require('mongoose-troop')
  ;

var ProductListSchema = new Schema({
    pid: { type: Schema.Types.ObjectId, ref: 'Product' }
  , name: { type: String, required: true }
  , specs: { type: String }
  , quantity: { type: Number, required: true }
  , unit: { type: String, required: true }
  , quote: { type: Number }
});

var statusTypes = ['requested', 'quoted', 'ordered', 'paid', 'delivered', 'cancelled'];

var TxnSchema = new Schema({
    tid: { type: String, required: true }
  , uid: { type: Schema.Types.ObjectId, ref: 'User' }
  , products: [ ProductListSchema ]
  , info: { type: String }
  , status: { type: String, required: true, enum: statusTypes }
  , company: {
      name: { type: String, required: true }
    , street: { type: String }
    , city: { type: String }
    , state: { type: String }
    , country: { type: String, required: true, default: 'IND' }
    , zip: { type: String }
  }
  , contact: { // add delivery address
      name: {
          first: { type: String, required: true }
        , last: { type: String, required: true }
      }
    , email: { type: String, required: true }
    , mobile: { type: Number }
    , landline: {
        area: { type: Number }
      , no: { type: Number }
    }
  }
  , reqDue: { type: Date, required: true }
  , payMode: { type: String }
  , bank: {
      name: { type: String }
    , accNo: { type: String }
    , accName: { type: String }
  }
});

// adds created and updated timestamps to the document
TxnSchema.plugin(troop.timestamp, {modifiedPath: 'updated', useVirtual: false});

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
      break;
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