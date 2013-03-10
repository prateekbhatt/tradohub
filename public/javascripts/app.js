'use strict';

// Declare app level module which depends on filters, and services
var amdavad = angular.module('amdavad', ['amdavad.filters', 'amdavad.services', 'amdavad.directives', 'ui.bootstrap']);

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
    when('/products', {
      templateUrl: 'partials/products',
      controller: ProductListCtrl
    }).
    when('/products/:id', {
      templateUrl: '/partials/product',
      controller: ProductDetailCtrl
    }).
    when('/quote', {
      templateUrl: '/partials/txn',
      controller: TxnCtrl
    }).
    when('/admin/products', {
      templateUrl: '/partials/adminProducts',
      controller: AdminProductsCtrl
    }).
    when('/admin/products/:id', {
      templateUrl: '/partials/adminEditProduct',
      controller: EditProductCtrl
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
  // $rootScope.user = '';
  // $rootScope.user.isLoggedIn = false;
  // $rootScope.user.email = '';
})