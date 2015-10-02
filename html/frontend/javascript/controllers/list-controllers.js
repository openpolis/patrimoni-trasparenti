angular.module('PatrimoniTrasparenti')
  .controller('ListController', ['$scope', 'Declarations', function($scope, Declarations){
    $scope.spinner = true;
    Declarations.getBy($scope.type, $scope.key)
      .success(function(results){
        $scope.spinner = false;
        $scope.results = results;
      })
      .catch(function(resp) {
        $scope.spinner = false;
        $scope.errors = true;
      });
  }]);
