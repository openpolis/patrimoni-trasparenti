angular.module('PatrimoniTrasparenti')
  .controller('BreadCrumbController', ['$scope', '$location', function($scope, $location){
      $scope.$on('$locationChangeSuccess', function(event) {
          //$scope.current = $location.path().replace(/^\//gm,'');
          $scope.current = '';
          var splitted = $location.path().split('/');
          var last = splitted[splitted.length-1];
          // remove last element if it is a number
          for (var e in splitted) {
            //console.log(e);
            if (e === 0) {
              continue;
            };
            if (!isNaN(splitted[e])) {
              //console.log("a number " +splitted[e]);
              continue;
            };
            //console.log(splitted[e]);
            $scope.current += ' '+ splitted[e] + ' /';
          };
          $scope.current = $scope.current.trim();
          $scope.current = $scope.current.replace(/ \/$/,'');
          if ($location.path() === '/') {
            $scope.showBread = false;
          } else {
            $scope.showBread = true;
        };
      });
  }]);
