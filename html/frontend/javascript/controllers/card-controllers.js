angular.module('PatrimoniTrasparenti')
  .controller('CardController', function($scope, $http, $routeParams){
    this.spinner = true;
    var controller = this;
    // FIXME create an open version of this
    $http.get('//patrimoni.staging.openpolis.it/api/p/parlamentari/' + $routeParams.id)
      .success(function(scheda){
        $scope.scheda = scheda;
      })
      .catch(function(resp) {
        controller.spinner = false;
        controller.errors = true;
      });
  });
