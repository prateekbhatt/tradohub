'use strict';
function IndexCtrl() {};

function LoginCtrl($scope, $http, $location, Auth) {
  $scope.form = {};
  $scope.error = '';
  $scope.submitLogin = function () {
    $http.post('/login', $scope.form).
      success(function(data) {
        Auth.session.isLoggedIn = true;
        Auth.session.email = data.email;
        Auth.session.userId = data._id;
        Auth.session.roles = data.roles;
        $scope.error = '';
        $location.path('/quote');
      }).
      error(function(data, status) {
        $scope.error = data.error ? data.error.message : 'Email / password not correct';
        Auth.logout(function () {
          Auth.session.isLoggedIn = false;
          Auth.session.email = '';
          Auth.session.userId = '';
          Auth.session.roles = [];
        });
      });
  };
};
LoginCtrl.$inject = ['$scope','$http','$location', 'Auth'];


function RegisterCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.error = '';
  $scope.submitRegister = function () {
    if ($scope.form.password !== $scope.form.confirmPassword) {
      $scope.error = 'Password and confirm password do not match.';
    } else {
      $scope.error = '';
      $http.post('/register', $scope.form).
        success(function(data) {
          $location.path('/login');
        }).
        error(function(data) {
          $scope.error = data.error ? data.error.message : '';
        });
    }
  };
};
RegisterCtrl.$inject = ['$scope','$http','$location', 'Auth'];


function ProductListCtrl($scope, ProductCatalog) {
  $scope.products = ProductCatalog.products;
};
ProductListCtrl.$inject = ['$scope', 'ProductCatalog'];


function ProductDetailCtrl($scope, $routeParams, ProductCatalog) {
  $scope.product = ProductCatalog.getProduct($routeParams.id);
};
ProductDetailCtrl.$inject = ['$scope','$routeParams','ProductCatalog'];


function NavbarCtrl($scope, $location, Auth) {
  $scope.isLoggedIn = function isLoggedIn () {
    return Auth.session.isLoggedIn; 
  };
  $scope.getEmail = function getEmail () {
    return Auth.session.email;
  };
  $scope.isAdmin = function isAdmin () {
    return (Auth.session.roles.indexOf('admin') > -1);
  };
  $scope.logout = function logout () {
    Auth.logout(function () {
      Auth.session.isLoggedIn = false;
      Auth.session.email = '';
      Auth.session.userId = '';
      Auth.session.roles = [];
      $location.path('/');
    });
  }
  $scope.routeIs = function(routeName) {
    console.log('INSIDE routeIs '+$location.path()+' '+routeName)
    return $location.path() === routeName;
  };
};
NavbarCtrl.$inject = ['$scope','$location', 'Auth'];


function AdminProductsCtrl($scope, $location, ProductCatalog) {
  $scope.form = {};
  $scope.form.product = {};
  $scope.products = ProductCatalog.products;
  $scope.deleteProduct = function (id) {
    Product.delete({ Id: id }, function () {
      ProductCatalog.getProducts();
      $scope.products = ProductCatalog.products;
      // TODO : remove product from scope
    })
  };
  $scope.addProduct = function () {
    Product.save($scope.form, function () {
      $scope.products = ProductCatalog.products;
      $scope.form.product = {};
    });
  };
};
AdminProductsCtrl.$inject = ['$scope','$location', 'ProductCatalog'];


function EditProductCtrl($scope, $routeParams, $location, Product, ProductCatalog) {
  $scope.form = {};
  $scope.form.product = ProductCatalog.getProduct($routeParams.id);
  $scope.submitProduct = function () {
    Product.update({ Id: $scope.form.product._id }, $scope.form, function () {
      ProductCatalog.getProducts();
      $location.path("/admin/products");
    })
  };
};
EditProductCtrl.$inject = ['$scope','$routeParams','$location', 'Product', 'ProductCatalog'];


function TxnCtrl($scope, ProductCatalog, Txn, Auth) {
  $scope.step = "one";
  // $scope.stepOne = true;
  $scope.showMoreInfo = true;
  $scope.form = {"txn": {"products": [{}], "rfq": {"quoteDue": "3"}}, 
                "user": { "email": Auth.session.email},
                "address": {"phone": {}}};
  $scope.products = ProductCatalog.products;
  $scope.units = ['kg', 'tonne', 'piece']
  // $scope.addresses = Address.query()
  $scope.gotoStep = function (step) {
    $scope.step = step;
    // $scope.stepOne = !$scope.stepOne;
  };
  $scope.stepIs = function (step) {
    return $scope.step === step;
  }
  $scope.getDate = function () {
    var date = new Date();
    return date.toDateString();
  };
  $scope.addProductField = function () {
    $scope.form.txn.products.push({});
  };
  $scope.submitTxn = function () {
    Txn.save($scope.form, function () {
      console.log('Txn SAVED');
      $location.path('/orders');
    })
  };
};
TxnCtrl.$inject = ['$scope', 'ProductCatalog', 'Txn', 'Auth'];


function OrderListCtrl($scope, Txn) {
  $scope.orders = Txn.query();
  $scope.getStatus = function (id) {
    var status = $scope.orders[id].status;
    if (status === 'rfq') {
      return 'RFQ Sent. Waiting for Quote.';
    }
  }
};
OrderListCtrl.$inject = ['$scope','Txn'];


function OrderDetailCtrl($scope, $routeParams, Txn) {
  $scope.txn = Txn.get({ Id: $routeParams.id });
};
OrderDetailCtrl.$inject = ['$scope','$routeParams','Txn'];


