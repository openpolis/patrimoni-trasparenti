angular.module('PatrimoniTrasparenti')
  .controller('CardController', ['$scope', 'Declarations', function($scope, Declarations){
    $scope.spinner = true;
    // FIXME create an open version of this API
    Declarations.get($scope.declarationId)
      .success(function(scheda){
        $scope.spinner = false;
        $scope.scheda = scheda;
      })
      .catch(function(resp) {
        $scope.spinner = false;
        $scope.errors = true;
      });
  }]);
