'use strict';

// Declare app level module which depends on filters, and services
var amdavad = angular.module('amdavad', ['amdavad.services', 'ui.bootstrap']);

amdavad.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      access: 'public',
      templateUrl: 'partials/index',
      controller: IndexCtrl
    }).
    when('/login', {
      access: 'public',
      templateUrl: 'partials/login',
      controller: LoginCtrl
    }).
    when('/register', {
      access: 'public',
      templateUrl: 'partials/register',
      controller: RegisterCtrl
    }).
    when('/products', {
      access: 'public',
      templateUrl: 'partials/products',
      controller: ProductListCtrl
    }).
    when('/products/:id', {
      access: 'public',
      templateUrl: '/partials/product',
      controller: ProductDetailCtrl
    }).
    when('/quote', {
      access: 'user',
      templateUrl: '/partials/txn',
      controller: TxnCtrl
    }).
    when('/orders', {
      access: 'user',
      templateUrl: '/partials/orders',
      controller: OrderListCtrl
    }).
    when('/orders/:id', {
      access: 'user',
      templateUrl: '/partials/order',
      controller: OrderDetailCtrl
    }).
    when('/admin/products', {
      access: 'admin',
      templateUrl: '/partials/adminProducts',
      controller: AdminProductsCtrl
    }).
    when('/admin/products/:id', {
      access: 'admin',
      templateUrl: '/partials/adminEditProduct',
      controller: EditProductCtrl
    }).
    otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}])
.run( function($rootScope, $location, $route, Auth) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    Auth.userCheck();
    if (next.$route.access !== 'public') {
      if (!Auth.session.isLoggedIn) {
        if (next.$route.templateUrl !== "partials/login") {
          Auth.session.nextUrl = $location.path();
          $location.path("/login");
        }
      } else if (next.$route.access === 'admin') {
        if (!(Auth.session.roles.indexOf('admin') > -1)) {
          $location.path("/");          
        }
      }
    }
  });
});
amdavad.run(function(Auth, ProductCatalog) {
  Auth.userCheck();
  ProductCatalog.getProducts();
});