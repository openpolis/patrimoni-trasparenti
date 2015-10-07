angular.module("PatrimoniTrasparenti")
  .directive('starRating', ["$timeout", function ($timeout) {
    return {
      restrict: 'EA',
      template:
        '<span ng-repeat="star in stars">' +
        '  <span class="glyphicon" ng-class="className($index)"></span>' +
        '</span>',
      scope: {
        starsNumber: '=',
        max: '=?' // optional (default is 5)
      },
      link: function(scope, element, attributes) {
        scope.$watch('starsNumber', function(starsNumber) {
          if (scope.max == undefined) {
            scope.max = 5;
          };
          scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
              scope.stars.push({
                filled: i < scope.starsNumber
              });
            }
        });
        scope.className = function(i){
          if (scope.stars[i].filled) {
            return 'glyphicon-star'
          } else {
            return 'glyphicon-star-empty'
          };
        };
      }
    };
}])
