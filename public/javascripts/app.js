'use strict';

// Declare app level module which depends on filters, and services
var amdavad = angular.module('amdavad', ['amdavad.filters', 'amdavad.services', 'amdavad.directives']);

amdavad.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/index',
      controller: IndexCtrl
    }).
    when('/login', {
      templateUrl: 'partials/login',
      controller: LoginCtrl
    }).
    when('/register', {
      templateUrl: 'partials/register',
      controller: RegisterCtrl
    }).
    when('/logout', {
      templateUrl: 'partials/index',
      // template:'<div ng-include="templateUrl">Loading...</div>',
      controller: LogoutCtrl
    }).
    when('/readPost/:id', {
      templateUrl: 'partials/readPost',
      controller: ReadPostCtrl
    }).
    when('/editPost/:id', {
      templateUrl: 'partials/editPost',
      controller: EditPostCtrl
    }).
    when('/deletePost/:id', {
      templateUrl: 'partials/deletePost',
      controller: DeletePostCtrl
    }).
    otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}])
// run( function($rootScope, $location, $route) {
//   $rootScope.$on('$rootChangeStart', function (event, next, current) {
//     if ($rootScope.isLoggedIn === null) {
//       if (next.$route.templateUrl !== 'partials/login') {
//         $location.path('/login');
//       }
//     }
//   });
// });
amdavad.run(function($rootScope) {
  $rootScope.user = '';
  $rootScope.user.isLoggedIn = false;
  $rootScope.user.email = '';
})