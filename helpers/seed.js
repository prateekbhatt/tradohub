module.exports = function bootstrapApp (Product, User, Txn) {
  'use strict';

  // Seed Products

  var products = [
      { name: 'Long Product Steel' }
    , { name: 'Flat Product Steel' }
    , { name: 'Chemical A' }
    , { name: 'Chemical B' }
    , { name: 'Chemical C' }
  ];

  function seedPro (product) {
    Product.create(product, function (err, isSaved) {
      if (err) {
        if (err.code === 11000) {
          return console.log(product.name, 'already exists.')
        }
        return console.log(err);
      }
      if (isSaved) {
        console.log('PRODUCT ' + isSaved.name + ' is saved');
      } else {
        console.log('PRODUCT is NOT saved NOW');
      }
    });    
  }

  for (var i in products) {
    seedPro(products[i])
  }

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
  //   Txn.create(txn, userId, addressId, function (err, savedTxn) {
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

  var user = {
      name: {
          first: 'Admin'
        , last: 'Prat'
      }
    , email: 'admin@gmail.com'
    , password: 'p'
    , roles: ['admin']
  };
  
  User.create(user, function (err, isRegistered) {
    if (err) {
      if (err.code === 11000) {
        return console.log('User \'', user.email, '\' already exists.')
      }
      return console.log(err);
    }
    if (isRegistered) {
      console.log ('User ' + isRegistered.email + ' successfully registered');
    } else {
      console.log(new Error('User Not Registered. Check all input fields.'));
    }
    // User.getUserByEmail(user.email, function (err, gotUser) {
    //   err ? console.log(err) : seedAddress(gotUser._id, address);
    // });
  });

};