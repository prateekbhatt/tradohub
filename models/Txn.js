'use strict';
module.exports = function (mongoose) {
  var Schema = mongoose.Schema;
  
  var ProductListSchema = new Schema({
      _product: { type: Schema.Types.ObjectId, ref: 'Product' }
    , quantity: { type: Number, required: true }
    , unit: { type: String, required: true }
  });

  var TxnSchema = new Schema({
      txnId: { type: String, required: true }
    , _user: { type: Schema.Types.ObjectId, ref: 'User' }
    , description: { type:String }
    , info: { type: String }
    , created: { type: Date, default: Date.now }
    , quoteDue: { type: Number, required: true }
    , reqDue: { type: Number, required: true }
    , approxVal: { type: Number, required: true }
    , status: { type: String, required: true }
    , products: [ ProductListSchema ]
    , _address: { type: Schema.Types.ObjectId, ref: 'Address' }
  });

  var Txn = mongoose.model('Txn', TxnSchema);

  var generateTxnId = function generateTxnId () {
    var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG",
                      "SEP", "OCT", "NOV", "DEC"]
      , chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
      , date = new Date()
      , txnId = date.getFullYear() + monthNames[date.getMonth()] + date.getDate();
    for ( var x = 0; x < 5; x++ ) {
      var i = Math.floor( Math.random() * 35 );
      txnId += chars.charAt( i );
    }
    return txnId;
  };

  var getTxn = function getTxn (txnId, fn) {
    Txn.findOne({ txnId: txnId }, function(err, txn) {
      err ? fn(err) : fn(null, txn);
    });
  };

  var getAllTxns = function getAllTxns (fn) {
    Txn.find({}, function(err, txns) {
      err ? fn(err) : fn(null, txns);
    });
  };

  var getUserTxn = function getUserTxn (userId, txnId, fn) {
    Txn.findOne( { txnId: txnId, _user: userId }, function (err, txn) {
      err ? fn(err) : fn(null, txn);
    });
  };

  var getUserTxns = function getUserTxns (userId, fn) {
    Txn.find({ _user: userId }, function(err, txns) {
      err ? fn(err) : fn(null, txns);
    });
  };

  var addTxn = function addTxn (txn, userId, addressId, fn) {
    var newTxn = new Txn({
        _user: userId
      , des: txn.des
      , info: txn.info
      , quoteDue: txn.quoteDue
      , reqDue: txn.reqDue
      , approxVal: txn.approxVal
      , status: txn.status
      , _address: addressId
    });
    
    newTxn.txnId = generateTxnId(); // TODO : check if txn id already exists
    
    newTxn.products = [];
    for (i in txn.products) {
      var txnProduct = txn.products[i]
      var newProduct = {
          _product: txnProduct._product
        , quantity: txnProduct.quantity
        , unit: txnProduct.unit
      }
      console.log('INSIDE addTxn : product : ')
      console.log(newProduct);
      newTxn.products.push(newProduct);
    }
    console.log(newTxn)

    newTxn.save(function (err, savedTxn) {
      err ? fn(err) : fn(null, savedTxn);
    });
  };

  var editTxn = function editTxn (id, txn, fn) {
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

  var deleteTxn = function deleteTxn (id, fn) {
    Txn.findByIdAndRemove(id, function (err, isDeleted) {
      err ? fn(err) : fn(null, isDeleted);
    });
  };

  return {
      Txn: Txn
    , getTxn: getTxn
    , getAllTxns: getAllTxns
    , getUserTxn: getUserTxn
    , getUserTxns: getUserTxns
    , addTxn: addTxn
    , editTxn: editTxn
    , deleteTxn: deleteTxn
  }
};