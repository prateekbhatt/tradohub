'use strict';
module.exports = function (Txn) {
  var txn = function (req, res) {
    var txnId = req.params.txnId
      , userId = req.user._id;
    Txn.getTxn(txnId, function (err, txn) {
      if (txn) {
        res.json(200, txn);
      } else {
        res.json(404, 'Txn Not Found')
      }
    })
  };
  var txns = function (req, res) {
    Txn.getAllTxns(function (err, txns) {
      if (txns) {
        res.json(200, txns);
      }
    });
  };
  var userTxn = function userTxn (req, res) {
    var userId = req.params.userId
      , txnId = req.params.txnId;
    Txn.getUserTxn(userId, txnId, function (err, txn) {
      if (err) {
        console.log(err);
        res.json(500);
      }
      if (txn) {
        res.json(200, txn);
      } else {
        res.json(200, {}); // TODO : Check status code
      }
    });
  };
  var userTxns = function (req, res) {
    var userId = req.user._id; 
    Txn.getUserTxns(userId, function (err, txns) {
      if (err) {
        console.log(err);
        res.json(500);
      } else if (txns) {
        res.json(200, txns);
      } else {
        res.json(200, {}); //Check status code
      }
    });
  };
  var addTxn = function (req, res) {
    var txn = req.body.txn
      , userId = req.user._id
      , addressId = req.body.addressId;
    Txn.addTxn(txn, userId, addressId, function (err, txn) {
      if (err) {
        console.log(err);
        res.json(500);
      } else if (txn) {
        res.json(200, 'Txn Saved');
      } else {
        res.json(400, 'Txn Not Saved');
      }
    });
  };

  var editTxn = function (req, res) {
    var id = req.params.id;
    var txn = req.body.txn;
    Txn.editTxn(id, txn, function (err, isSaved) {
      if (err) {
        console.log(err);
        res.json(500, 'Txn Not Updated');
      } else if (isSaved) { res.json(200); }
    });
  };

  var deleteTxn = function (req, res) {
    var id = req.params.id;
    Txn.deleteTxn(id, function(err, isDeleted) {
      if (err) {
        console.log(err);
        res.json(500, 'Txn Not Deleted');
      } else if (isDeleted) { res.json(200); }
    })
  }

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