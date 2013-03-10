'use strict';

/* Services */

angular.module('amdavad.services', ['ngResource']).
  value('version', '0.1').
  service('Auth', function ($http, $resource) {
    return {
      isLoggedIn: false,
      email: '',
      userId: '',
      getEmail: function () {
        return this.email;
      },
      userCheck: function () {
        var value = this;
        var updateCallback = function updateCallback (data, value) {
          value.email = data.user.email;
          value.isLoggedIn = data.user.isLoggedIn;
          value.userId = data.user._id;
          return;
        }
        var getUser = function getUser (updateCallback, value) {
          $http.get('/me')
            .success(function (data) {
              return updateCallback(data, value);
            })
            .error(function (data) {
              return updateCallback(data, value);
            });
        }
        getUser(updateCallback, value);
        return;
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
    return $resource('/api/txn/:Id', { Id: '@Id' },
      { 'update': { method: 'PUT'}});
  }).
  factory('User', function ($resource, Auth) {
    return $resource('/api/users/:userId/addresses/:addressId',
      { userId: this.userId, addressId: '@addressId' },
      { 'update': { method: 'PUT' },
        'addresses': { method: 'GET' }});
  });