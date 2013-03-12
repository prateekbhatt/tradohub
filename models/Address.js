module.exports = function (mongoose) {
  'use strict';
  var Schema = mongoose.Schema;

  var AddressSchema = Schema({
      company: { type: String }
    , name: { type: String }
    , street: { type: String, required: true }
    , city: { type: String }
    , state: { type: String }
    , country: { type: String, required: true }
    , pin: { type: Number, required: true }
    , phone: {
          countryCode: { type: Number }
        , number: { type: Number }
      }
    , _user: { type: Schema.Types.ObjectId, ref: 'User'}
  });

  var Address = mongoose.model('Address', AddressSchema);

  var getAddress = function getAddress (addressId, fn) {
    Address.findById( addressId, function(err, address) {
      fn(err, address);
    });
  };

  var getUserAddress = function getUserAddress (userId, addressId, fn) {
    Address.findOne({ _id: addressId, _user: userId }, function (err, address) {
      fn(err, address);
    });
  };

  var getUserAddresses = function getUserAddresses (userId, fn) {
    Address.find({ _user: userId }, function(err, addresses) {
      fn(err, addresses);
    });
  };

  var addAddress = function addAddress (address, userId, fn) {
    var newAddress = new Address({
        company: address.company
      , name: address.name
      , street: address.street
      , city: address.city
      , state: address.state
      , country: address.country
      , pin: address.pin
      , _user: userId
    });

    newAddress.phone = {};
    newAddress.phone.countryCode = address.phone ? address.phone.countryCode : null;
    newAddress.phone.number = address.phone ? address.phone.number : null;
    
    newAddress.save(function (err, savedAddress) {
      fn(err, savedAddress);
    });
  };

  var editAddress = function editAddress (address, userId, addressId, fn) {
    Address.findOne({ _id: addressId, _user: userId }, function (err, gotAddress) {
      if (err) { fn(err); }
      if (gotAddress) {
        console.log(gotAddress)
        
        gotAddress.company = address.company;
        gotAddress.street = address.street;
        gotAddress.city = address.city;
        gotAddress.state = address.state;
        gotAddress.country = address.country;
        gotAddress.pin = address.pin;

        gotAddress.phone.countryCode = address.phone ? address.phone.countryCode : null;
        gotAddress.phone.number = address.phone ? address.phone.number : null;

        gotAddress.save(function (err, savedAddress) {
          fn(err, savedAddress);
        });
      } else {
        fn(new Error('Address Not Found'));
      }
    });
  };

  var deleteAddress = function deleteAddress (userId, addressId, fn) {
    Address.findOne({ _id: addressId, _user: userId }, function (err, address) {
      if (err) { fn(err); }
      if (address) {
        address.remove(function (err, isDeleted) {
          fn(err, true);          
        });
      } else {
        fn(new Error ('Address Not Found'));
      }
    });
  };

  return {
      Address: Address
    , getAddress: getAddress
    , getUserAddress: getUserAddress
    , getUserAddresses: getUserAddresses
    , addAddress: addAddress
    , editAddress: editAddress
    , deleteAddress: deleteAddress
  }
};