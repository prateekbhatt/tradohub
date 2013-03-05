'use strict';

/* Controllers */

function IndexCtrl($scope, $http, $location, User) {
  // console.log('CHECKING IF USER loggedIn: ');
  User.userCheck();
};

function LoginCtrl($scope, $http, $location) {
  console.log('LOGIN TRY ');
  $scope.form = {};
  $scope.invalidEmailPassword = false;
  $scope.submitLogin = function () {
    $http.post('/login', $scope.form).
      success(function(data, status, headers, config) {
        $scope.invalidEmailPassword = false;
        $location.path('/');
      }).
      error(function(data, status, headers, config) {
        $scope.invalidEmailPassword = true;
      }) ;
  };
};

function RegisterCtrl($scope, $http) {
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

function LogoutCtrl($http, $location) {
  $http.get('/logout').success(function(data) {
    console.log('USER LOGGED OUT');
    $location.path('/');
  });
};

function DashboardCtrl($scope, $http) {

};

function NavbarCtrl($scope, $rootScope, $location, User) {
  $scope.user = {};
  User.userCheck()
  $scope.isLoggedIn = function isLoggedIn () {
    $scope.user.isLoggedIn = User.isLoggedIn;
    return $scope.user.isLoggedIn;    
  }
  $scope.getEmail = function getEmail () {
    $scope.user.email = User.email;
    return $scope.user.email;    
  }
  // $scope.$on( 'User.update', function( event, isLoggedIn ) {
  //    $scope.user.isLoggedIn = isLoggedIn;
  //  });
  console.log($scope.user)
  $scope.routeIs = function(routeName) {
    return $location.path() === routeName;
  };
};

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });

  $scope.deletePost = function () {
    $http.delete('/api/post/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}
