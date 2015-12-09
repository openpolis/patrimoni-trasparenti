angular.module('PatrimoniTrasparenti')
  .controller('BreadCrumbController', ['$scope', '$location', function($scope, $location){
      $scope.$on('$locationChangeSuccess', function(event) {
          $scope.current = $location.path().replace(/^\//gm,'');
      });
  }]);
