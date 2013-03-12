'use strict';

/* Services */

angular.module('amdavad.services', ['ngResource']).
  service('Auth', function ($http, $resource) {
    return {
      session: {
        isLoggedIn: false,
        email: '',
        userId: '',
        roles: []
      },
      getEmail: function () {
        return this.session.email;
      },
      userCheck: function () {
        var session = this.session;
        var updateCallback = function updateCallback (data, session) {
          session.isLoggedIn = data ? data.user.isLoggedIn : false;
          session.email = data ? data.user.email : '';
          session.userId = data ? data.user._id : '';
          session.roles = data ? data.user.roles : [];
          return;
        }
        var getUser = function getUser (updateCallback, session) {
          $http.get('/me')
            .success(function (data, status) {
              updateCallback(data, session);
            })
            .error(function (data) {
              updateCallback(null, session);
            });
        }
        getUser(updateCallback, session);
      },
      logout: function (callback) {
        $http.get('/logout')
          .success( function (data) {
            return callback(data);
          });
      }
    };
  }).
  factory('Product', function ($resource) {
    return $resource('/api/products/:Id', { Id: '@Id' },
      { 'update': { method: 'PUT'}});
  }).
  factory('Txn', function ($resource) {
    return $resource('/api/txns/:Id', { Id: '@Id' },
      { 'update': { method: 'PUT'}});
  }).
  factory('User', function ($resource, Auth) {
    return $resource('/api/users/:userId/addresses/:addressId',
      { userId: this.userId, addressId: '@addressId' },
      { 'update': { method: 'PUT' },
        'addresses': { method: 'GET' }});
  }).
  factory('ProductCatalog', function (Product) {
    return {
      products: [],
      getProducts: function () {
        this.products = Product.query();
      },
      getProduct: function (productUrl) {
        for (var i in this.products) {
          if (this.products[i].url === productUrl) {
            return this.products[i];            
          }
        }
      }
    }
  });