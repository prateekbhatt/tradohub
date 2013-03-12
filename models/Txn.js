module.exports = function (mongoose) {
  'use strict';
  var Schema = mongoose.Schema;
  
  var ProductListSchema = new Schema({
      _product: { type: Schema.Types.ObjectId, ref: 'Product' }
    , quantity: { type: Number, required: true }
    , unit: { type: String, required: true }
  });

  var TxnSchema = new Schema({
      txnId: { type: String, required: true }
    , _user: { type: Schema.Types.ObjectId, ref: 'User' }
    , _address: { type: Schema.Types.ObjectId, ref: 'Address' }
    , products: [ ProductListSchema ]
    , created: { type: Date, default: Date.now }
    , status: { type: String, required: true }
    , rfq: {      
          description: { type:String }
        , info: { type: String }
        , quoteDue: { type: Number, required: true }
        , reqDue: { type: Number, required: true }
        , approxVal: { type: Number, required: true }
      }
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
      fn(err, txn);
    });
  };

  var getAllTxns = function getAllTxns (fn) {
    Txn.find({}, function(err, txns) {
      fn(err, txns);
    });
  };

  var getUserTxn = function getUserTxn (userId, txnId, fn) {
    Txn.findOne( { txnId: txnId, _user: userId }, function (err, txn) {
      fn(err, txn);
    });
  };

  var getUserTxns = function getUserTxns (userId, fn) {
    Txn.find({ _user: userId }, function(err, txns) {
      fn(err, txns);
    });
  };

  var addTxn = function addTxn (txn, userId, addressId, fn) {
    var newTxn = new Txn({
        _user: userId
      , _address: addressId
      , status: txn.status
    });
    newTxn.rfq = {
        description: txn.rfq.description
      , info: txn.rfq.info
      , quoteDue: txn.rfq.quoteDue
      , reqDue: txn.rfq.reqDue
      , approxVal: txn.rfq.approxVal
    };
    
    newTxn.txnId = generateTxnId(); // TODO : check if txn id already exists
    
    newTxn.products = [];
    for (var i in txn.products) {
      var txnProduct = txn.products[i]
      var newProduct = {
          _product: txnProduct._id
        , quantity: txnProduct.quantity
        , unit: txnProduct.unit
      };
      newTxn.products.push(newProduct);
    }
    console.log(newTxn)

    newTxn.save(function (err, savedTxn) {
      fn(err, savedTxn);
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
      fn(err, isDeleted);
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