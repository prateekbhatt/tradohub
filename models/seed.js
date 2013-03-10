'use strict';
module.exports = function bootstrapApp (Product, User, Address, Txn) {

  // Seed Products

  var productsObj = [
      { name: 'Long Product Steel' }
    , { name: 'Flat Product Steel' }
    , { name: 'Chemical A' }
    , { name: 'Chemical B' }
    , { name: 'Chemical C' }
  ];

  for (var i in productsObj) {
    Product.addProduct(productsObj[i], function (err, isSaved) {
      if (err) return console.log(err);
      if (isSaved) {
        console.log('PRODUCT ' + isSaved.name + ' is saved');
      } else {
        console.log('PRODUCT is NOT saved NOW');
      }
    });
  }

  // Seed Address

  var address = {
      company: 'Company ABC Pvt. Ltd.'
    , street: '45, Usmanpura'
    , city: 'Ahmedabad'
    , state: 'Gujarat'
    , country: 'India'
    , pin: '654321'
  };

  // var seedAddress = function seedAddress (userId, address) {
  //   Address.addAddress(userId, address, function (err, savedAddress) {
  //     if (err) {
  //       console.log(err);
  //     } else if (savedAddress) {
  //       console.log('Address is saved : ' + savedAddress);
  //     } else {
  //       console.log('Address not saved: ' + savedAddress);
  //     }
  //     Address.getUserAddresses(userId, function (err, addresses) {
  //       seedTxn(userId, addresses[0]._id);
  //     })
  //   });
  // };

  // Seed Txn

  var txn = {
      des: 'This is description provided for this RFQ'
    , info: 'We need this stuff urgently and we want it to be delivered through FedEx.'
    , quoteDue: 3
    , reqDue: 15
    , approxVal: 105000
    , status: 'rfq'
    , products: [
        { _product: '513b26ce5363025b3e000003', quantity: 123, unit: 'kg' },
        { _product: '513b26ce5363025b3e000004', quantity: 2, unit: 'tonne' }
      ]
  };

  // var seedTxn = function seedTxn (userId, addressId) {
  //   Txn.addTxn(txn, userId, addressId, function (err, savedTxn) {
  //     if (err) {
  //       console.log(err);
  //     } else if (savedTxn) {
  //       console.log('Txn is saved : ' + savedTxn);
  //     } else {
  //       console.log('Txn not saved: ' + savedTxn);
  //     }
  //   });
  // };

  // Seed user

  var user = { email: 'admin@gmail.com', password: 'p', roles: ['admin'] };
  
  User.addUser(user, function (err, isRegistered) {
    if (err) {
      console.log(err);
    } else if (isRegistered) {
      console.log ('User ' + isRegistered.email + ' successfully registered');
    } else {
      console.log(new Error('User Not Registered. Check all input fields.'));
    }
    // User.getUserByEmail(user.email, function (err, gotUser) {
    //   err ? console.log(err) : seedAddress(gotUser._id, address);
    // });
  });

};