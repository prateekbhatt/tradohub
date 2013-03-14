module.exports = function (Address) {
  'use strict';
  var address = function (req, res) {
    var addressId = req.params.addressId;
    Address.getAddress(addressId, function (err, address) {
      if (err) { console.log(err); }
      if (address) {
        res.json(200, address);
      } else {
        res.json(404, 'Address Not Found');
      }
    });
  };
  var addresses = function (req, res) {
    Address.getAllAddresses(function (err, addresses) {
      if (err) { console.log(err); }
      if (addresses) {
        res.json(200, addresses);
      } else {
        res.json(404, 'No Address Found');
      }
    });
  };
  var userAddress = function userAddress (req, res) {
    var userId = req.user._id
      , addressId = req.params.addressId;
    Address.getUserAddress(userId, addressId, function (err, address) {
      if (err) { console.log(err); }
      if (address) {
        res.json(200, address);
      } else {
        res.json(400, { error: { message: 'Address Not Found' }}); // TODO : Check status code
      }
    });
  };
  var userAddresses = function userAddresses (req, res) {
    var userId = req.user._id; 
    Address.getUserAddresses(userId, function (err, addresses) {
      if(err) { console.log(err); }
      if (addresses) {
        res.json(200, addresses);
      } else {
        res.json(400, { error: { message: 'No Address Found' }}); //Check status code
      }
    });
  };
  var addAddress = function addAddress (req, res) {
    var address = req.body.address
      , userId = req.user._id; // TODO add validation
    Address.addAddress(address, userId, function (err, address) {
      if (err) { console.log(err); } 
      if (address) {
        res.json(200, { success: { message: 'Address Saved' }});
      } else {
        res.json(400, { error: { message: 'Address Not Saved. Check all input fields.' }});
      }
    });
  };
  var editAddress = function editAddress (req, res) {
    var userId = req.user._id
      , addressId = req.params.addressId
      , address = req.body.address;
    Address.editAddress(address, userId, addressId, function (err, isSaved) {
      if (err) { console.log(err); }
      if (isSaved) {
        res.json(200, { success: { message: 'Address Updated' }});
      } else {
        res.json(400, { error: { message: 'Address Not Updated. Check all input fields.' }});        
      }
    });
  };

  var deleteAddress = function deleteAddress (req, res) {
    var userId = req.user._id
      , addressId = req.params.addressId;
    Address.deleteAddress(userId, addressId, function(err, isDeleted) {
      if (err) { console.log(err); }
      if (isDeleted) {
        res.json(200, { success: { message: 'Address Deleted' }});
      } else {
        res.json(400, { error: { message: 'Address Not Found' }});
      }
    });
  };

  return {
      address: address
    , addresses: addresses
    , userAddress: userAddress
    , userAddresses: userAddresses
    , addAddress: addAddress
    , editAddress: editAddress
    , deleteAddress: deleteAddress

  };
};