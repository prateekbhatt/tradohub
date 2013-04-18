'use strict';

var tradohub = angular.module('tradohub', []);

function TxnCtrl($scope, $location) {
  $scope.form = {"txn": {"products": [{}], "rfq": {}},
                "address": {"phone": {}}};
  $scope.addProductField = function () {
    console.log('adding product')
    $scope.form.txn.products.push({});
  };
  $scope.removeProductField = function (index) {
    console.log('index', index)
    console.log($scope.form.txn.products[index])
    $scope.form.txn.products.splice(index, 1);
  };
  $scope.submitTxn = function () {
    console.log('submitting transaction')
    Txn.save($scope.form, function () {
      console.log('Txn SAVED');
      $location.path('/orders');
    });
  };
}
TxnCtrl.$inject = ['$scope', '$location'];