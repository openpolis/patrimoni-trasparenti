// TODO create an element fro this?
angular.module('PatrimoniTrasparenti')
  .controller('CardController', ['$scope', 'Declarations', '$routeParams', function($scope, Declarations, $routeParams){
    this.spinner = true;
    var controller = this;
    // FIXME create an open version of this API
    Declarations.get($routeParams.id)
      .success(function(scheda){
        controller.spinner = false;
        $scope.scheda = scheda;
      })
      .catch(function(resp) {
        controller.spinner = false;
        controller.errors = true;
      });
  }]);
