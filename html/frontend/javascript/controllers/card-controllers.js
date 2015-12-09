angular.module('PatrimoniTrasparenti')
  .controller('CardController', ['$scope', 'Declarations', '$location', '$anchorScroll', function($scope, Declarations, $location, $anchorScroll){
    $scope.selectYear = function(i) {
      $scope.scheda = $scope.schede[i] ;
    };
    $scope.spinner = true;
    $scope.scrollTo = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      //reset to old to keep any additional routing logic from kicking in
      $location.hash(old);
    };
    $scope.isNumber = function(value) {
      return angular.isNumber(value);
    };
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
