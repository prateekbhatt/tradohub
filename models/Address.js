'use strict';
module.exports = function (mongoose) {
  var Schema = mongoose.Schema;

  var AddressSchema = Schema({
      company: { type: String }
    , street: { type: String, required: true }
    , city: { type: String }
    , state: { type: String }
    , country: { type: String, required: true }
    , pin: { type: Number, required: true }
    , _user: { type: Schema.Types.ObjectId, ref: 'User'}
  });

  var Address = mongoose.model('Address', AddressSchema);

  var getAddress = function getAddress (addressId, fn) {
    Address.findById( addressId, function(err, address) {
      err ? fn(err) : fn(null, address);
    });
  };

  var getUserAddress = function getUserAddress (userId, addressId, fn) {
    Address.findOne( addressId, { _user: userId }, function (err, address) {
      err ? fn(err) : fn(null, address);
    });
  };

  var getUserAddresses = function getUserAddresses (userId, fn) {
    Address.find({ _user: userId }, function(err, addresses) {
      err ? fn(err) : fn(null, addresses);
    });
  };

  var addAddress = function addAddress (userId, address, fn) {
    var newAddress = new Address({
        company: address.company
      , street: address.street
      , city: address.city
      , state: address.state
      , country: address.country
      , pin: address.pin
      , _user: userId
    });
    newAddress.save(function (err, savedAddress) {
      err ? fn(err) : fn(null, savedAddress);
    });
  };

  var editAddress = function editAddress (userId, addressId, address, fn) {
    Address.findById(addressId, { _user: userId }, function (err, gotAddress) {
      if (err) {
        fn(err);
      } else if (gotAddress) {
        gotAddress.name = product.name;
        gotAddress.description = product.description;
        gotAddress.save(function (err, savedAddress) {
          err ? fn(err) : fn(null, savedAddress);
        });
      };
    });
  };

  var deleteAddress = function deleteAddress (userId, addressId, fn) {
    Address.findByIdAndRemove(addressId, { _user: userId }, function (err, isDeleted) {
      err ? fn(err) : fn(null, isDeleted);
    });
  };

  return {
      Address: Address
    , getAddress: getAddress
    , getUserAddresses: getUserAddresses
    , addAddress: addAddress
    , editAddress: editAddress
    , deleteAddress: deleteAddress
  }
};