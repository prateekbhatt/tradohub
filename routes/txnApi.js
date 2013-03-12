module.exports = function (Txn, Address) {
  'use strict';
  var request = require('request');

  var txn = function txn (req, res) {
    var txnId = req.params.txnId
      , userId = req.user._id;
    Txn.getTxn(txnId, function (err, txn) {
      if (err) { console.log(err); }
      if (txn) {
        res.json(200, txn);
      } else {
        res.json(404, { error: { message: 'Txn Not Found'}});
      }
    });
  };
  var txns = function txns (req, res) {
    Txn.getAllTxns(function (err, txns) {
      if (err) { console.log(err); }
      if (txns) {
        res.json(200, txns);
      } else {
        res.json(400, { error: { message: 'No Txn has been made.'}})
      }
    });
  };
  var userTxn = function userTxn (req, res) {
    var userId = req.user._id
      , txnId = req.params.txnId;
    Txn.getUserTxn(userId, txnId, function (err, txn) {
      if (err) { console.log(err); }
      if (txn) {
        res.json(200, txn);
      } else {
        res.json(404, { error: { message: 'Txn Not Found'}});
      }
    });
  };
  var userTxns = function userTxns (req, res) {
    var userId = req.user._id; 
    Txn.getUserTxns(userId, function (err, txns) {
      if (err) { console.log(err); }
      if (txns) {
        res.json(200, txns);
      } else {
        res.json(400, { error: { message: 'No txn has been made.'}}); //Check status code
      }
    });
  };
  // var addTxn = function addTxn (req, res) {
  //   var txn = req.body.txn
  //     , userId = req.user._id
  //     , addressId = req.body.address;
  //   Txn.addTxn(txn, userId, addressId, function (err, txn) {
  //     if (err) { console.log(err); }
  //     if (txn) {
  //       res.json(200, { success: { message: 'Txn Saved'}});
  //     } else {
  //       res.json(400, { error: { message: 'Txn Not Saved. Check all input fields.'}});
  //     }
  //   });
  // };
  var addTxn = function addTxn (req, res) {
    console.log('inside addTxn')
    console.log(req.body)
    console.log(req.user)
    var txn = req.body.txn
      , userId = req.user._id
      , addressId = req.body.addressId ? req.body.addressId : null
      , address = req.body.address;
      txn.status = 'rfq'; // initialised for request for quote 
      // if addressId not present/valid then user is inputting new address
      // save the new address and use the new addressId instead.
      if (typeof(addressId) !== 'string') {
        console.log('addressId not string')
        if (typeof(address) === 'object') {
          console.log('address is object')
          Address.addAddress(address, userId, function (err, address) {
            if (err) { console.log(err); } 
            if (address) {
              console.log('address Saved')
              addressId = address._id;
              Txn.addTxn(txn, userId, addressId, function (err, txn) {
                if (err) { console.log(err); }
                if (txn) {
                  console.log('txn Saved')
                  res.json(200, { success: { message: 'Txn Saved'}});
                } else {
                  console.log('txn failed')
                  res.json(400, { error: { message: 'Txn Not Saved. Check all input fields.'}});
                }
              });
            } else {
              console.log('address saving failed')
              res.json(400, { error: { message: 'Address Not Saved. Check all input fields.' }});
            }
          });          
        } else {
          res.json(400, { error: { message: 'Check your address fields.'}});
        }
      } else {
        console.log('addressId is string')
        Txn.addTxn(txn, userId, addressId, function (err, txn) {
          if (err) { console.log(err); }
          if (txn) {
            console.log('txn Saved')
            res.json(200, { success: { message: 'Txn Saved'}});
          } else {
            console.log('txn failed')
            res.json(400, { error: { message: 'Txn Not Saved. Check all input fields.'}});
          }
        });
      }
  };
  var editTxn = function editTxn (req, res) {
    var id = req.params.id;
    var txn = req.body.txn;
    Txn.editTxn(id, txn, function (err, isSaved) {
      if (err) { console.log(err); }
      if (isSaved) {
        res.json(200, { success: { message: 'Txn Updated'}});
      } else {
        res.json(400, { error: { message: 'Txn Not Updated. Check all input fields.'}});        
      }
    });
  };
  var deleteTxn = function deleteTxn (req, res) {
    var id = req.params.id;
    Txn.deleteTxn(id, function(err, isDeleted) {
      if (err) { console.log(err); }
      if (isDeleted) {
        res.json(200);
      } else {
        res.json(500, 'Txn Not Deleted');        
      }
    });
  };

  return {
      txn: txn
    , txns: txns
    , userTxn: userTxn
    , userTxns: userTxns
    , addTxn: addTxn
    , editTxn: editTxn
    , deleteTxn: deleteTxn

  }
}