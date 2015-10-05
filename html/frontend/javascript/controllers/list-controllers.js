angular.module('PatrimoniTrasparenti')
  .controller('ListController', ['$scope', '$filter', 'Declarations', function($scope, $filter, Declarations){
    $scope.orderK = "cognome";
    $scope.selectOrder = function(k) {
      // little hack to fire "scroll" event
      // for lazy images loading.
      window.scrollBy(0, 1);
      $scope.orderK = k;
    };
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
