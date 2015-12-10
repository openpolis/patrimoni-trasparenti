angular.module('PatrimoniTrasparenti')
  .controller('ListController', ['$scope', '$filter', 'Declarations', function($scope, $filter, Declarations){
    console.log('ctrl start');
    $scope.orderK = "cognome";
    // this function is no more used
    $scope.selectOrder = function(k) {
      // little hack to fire "scroll" event
      // for lazy images loading.
      window.scrollBy(0, 1);
      $scope.orderK = k;
      console.log('ctrl orderK', $scope.orderK);
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
