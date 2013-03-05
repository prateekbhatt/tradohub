'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('amdavad.services', []).
  value('version', '0.1').
  service('User', function ($rootScope, $http) {
    // var isLoggedIn = false
    //   , email = '';
    return {
      isLoggedIn: false,
      email: '',
      userCheck: function () {
        var value = this;
        var updateCallback = function updateCallback (data, value) {
          // value.user = data.user;
          value.email = data.user.email;
          value.isLoggedIn = data.user.isLoggedIn;
          value._id = data.user._id;
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
          console.log(value);
          // $rootScope.$broadcast( 'User.update', value.isLoggedIn );
          // this.isLoggedIn = value.isLoggedIn;
          // this.email = value.email;
          // console.log(this)
          return;
      },
      logout: function (callback) {
        $http.get('/logout')
          .success( function (data) {
            return callback(data);
          });
      }
    };
  });