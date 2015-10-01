angular.module('PatrimoniTrasparenti')
  .controller('CardController', ['$scope', 'Declarations', function($scope, Declarations){
    $scope.selectYear = function(i) {
      $scope.scheda = $scope.schede[i] ;
    };
    $scope.spinner = true;
    Declarations.getFor($scope.opId)
      .success(function(schede){
        $scope.spinner = false;
        $scope.schede = schede;
        $scope.scheda = schede[0];
      })
      .catch(function(resp) {
        $scope.spinner = false;
        $scope.errors = true;
      });
  }]);
