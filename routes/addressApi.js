'use strict';
module.exports = function (Address) {
  var address = function (req, res) {
    var address_url = req.params.address_url;
    Address.getAddress(address_url, function (err, address) {
      if (address) {
        res.json(200, address);
      } else {
        res.json(404, 'Address Not Found')
      }
    })
  };
  var addresses = function (req, res) {
    Address.getAllAddresses(function (err, addresses) {
      if (addresses) {
        res.json(200, addresses);
      }
    });
  };
  var userAddress = function userAddress (req, res) {
    var userId = req.params.userId
      , addressId = req.params.addressId;
    Address.getUserAddress(userId, addressId, function (err, address) {
      if (err) {
        console.log(err);
        res.json(500);
      }
      if (address) {
        res.json(200, address);
      } else {
        res.json(200, {}); // TODO : Check status code
      }
    });
  };
  var userAddresses = function (req, res) {
    var userId = req.user ? req.user._id : req.params.userId; 
    Address.getUserAddresses(userId, function (err, addresses) {
      if(err) {
        console.log(err);
        res.json(500);
      }
      if (!addresses) {
        res.json(200, {}); //Check status code
      } else {
        res.json(200, addresses);
      }
    });
  };
  var addAddress = function (req, res) {
    var address = req.body.address
      , userId = req.user ? req.user._id : '51312b9fdfcfb5ba26000001'
      , addressId = req.body.addressId || '51312b9fdfcfb5ba26000001';
    Address.addAddress(address, userId, addressId, function (err, address) {
      if (err) {
        console.log(err);
        res.json(500);
      } 
      if (address) {
        res.json(200, 'Address Saved');
      } else {
        res.json(400, 'Address Not Saved');
      }
    });
  };
  var editAddress = function (req, res) {
    var id = req.params.id;
    var address = req.body.address;
    Address.editAddress(id, address, function (err, isSaved) {
      if (err) {
        console.log(err);
        res.json(500, 'Address Not Updated');
      }
      if (isSaved) { res.json(200); }
    });
  };

  var deleteAddress = function (req, res) {
    var id = req.params.id;
    Address.deleteAddress(id, function(err, isDeleted) {
      if (err) {
        console.log(err);
        res.json(500, 'Address Not Deleted');
      }
      if (isDeleted) { res.json(200); }
    })
  }

  return {
      address: address
    , addresses: addresses
    , userAddress: userAddress
    , userAddresses: userAddresses
    , addAddress: addAddress
    , editAddress: editAddress
    , deleteAddress: deleteAddress

  }
}