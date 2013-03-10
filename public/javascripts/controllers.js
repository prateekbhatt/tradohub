'use strict';
function IndexCtrl(Auth) {
  Auth.userCheck();
};

function LoginCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.invalidEmailPassword = false;
  $scope.submitLogin = function () {
    $http.post('/login', $scope.form).
      success(function() {
        $scope.invalidEmailPassword = false;
        $location.path('/products');
      }).
      error(function() {
        $scope.invalidEmailPassword = true;
      }) ;
  };
};

function RegisterCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.errorMessage = '';
  $scope.submitRegister = function () {
    if ($scope.form.password !== $scope.form.confirmPassword) {
      $scope.errorMessage = 'Password and confirm password do not match.';
    } else {
      $scope.errorMessage = '';
      $http.post('/register', $scope.form).
        success(function(data) {
          $location.path('/login');
        }).
        error(function(data) {
          $scope.errorMessage = 'Error occured during registration. Try again.';
        });
    }
  };
};

function ProductListCtrl($scope, Product) {
  $scope.products = Product.query();
};

function ProductDetailCtrl($scope, $routeParams, Product) {
  $scope.product = Product.get({ Id: $routeParams.id });
};

function NavbarCtrl($scope, $location, Auth) {
  Auth.userCheck();
  $scope.isLoggedIn = function isLoggedIn () {
    // console.log('INSIDE isLoggedIn')
    return Auth.isLoggedIn; 
  }
  $scope.getEmail = function getEmail () {
    // console.log('INSIDE getEmail')
    return Auth.email;
  }
  $scope.logout = function logout () {
    Auth.logout(function () {
      Auth.userCheck();
      $location.path('/');
    });
  }
  $scope.routeIs = function(routeName) {
    console.log('INSIDE routeIs '+$location.path()+' '+routeName)
    return $location.path() === routeName;
  };
};
function AdminProductsCtrl($scope, $location, Product) {
  $scope.form = {};
  $scope.form.product = {};
  $scope.products = Product.query();
  $scope.deleteProduct = function (id) {
    Product.delete({ Id: id }, function () {
      $scope.products = Product.query();
      // TODO : remove product from scope
    })
  };
  $scope.addProduct = function () {
    Product.save($scope.form, function () {
      $scope.products = Product.query();
      $scope.form.product = {};
    });
  };
};

function EditProductCtrl($scope, $routeParams, $location, Product) {
  $scope.form = {};
  $scope.form.product = Product.get({ Id: $routeParams.id });
  $scope.submitProduct = function () {
    Product.update({ Id: $scope.form.product._id }, $scope.form, function () {
      $location.path("/admin/products");
    })
  };
};
function TxnCtrl($scope, Product, Txn, Auth) {
  $scope.formStep = "first";
  $scope.firstTab = true;
  $scope.showMoreInfo = true;
  $scope.form = {"txn": {"products": [{}]}, "user": {}};
  $scope.form.txn.due='3';
  $scope.formGoto = function (step) {
    $scope.formStep = step;
    $scope.firstTab = !$scope.firstTab;
  };
  $scope.formStepIs = function (step) {
    console.log('INSIDE formStepIs')
    return ($scope.formStep === step);
  };
  $scope.products = Product.query();
  $scope.form.user.email = Auth.getEmail();
  $scope.getDate = function () {
    var date = new Date();
    return date.toDateString();
  }
  $scope.addProductField = function () {
    $scope.form.txn.products.push({});
  };
  // $scope.addresses = Address.query()
  $scope.submitTxn = function () {
    Txn.save($scope.form, function () {
      console.log('Txn SAVED');
      $scope.form = {"txn": {"urgent": false, "products": [ {} ]}};
    })
  };
};