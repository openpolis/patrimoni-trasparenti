angular.module('PatrimoniTrasparenti')
  .controller('BreadCrumbController', ['$scope', '$location', function($scope, $location){
      $scope.$on('$locationChangeSuccess', function(event) {
          $scope.current = $location.path().replace(/^\//gm,'');
          if ($location.path() === '/') {
            $scope.showBread = false;
          } else {
            $scope.showBread = true;
        };
      });
  }]);
