angular.module("PatrimoniTrasparenti")
  .directive("ptList", [ '$timeout', function($timeout) {
    return {
      restrict: "E",
      scope: {
        type: "@",
        key: "@"
      },
      templateUrl: "templates/directives/pt-list.html",
      link: function(scope, element, attributes) {
        $timeout(function(){
          $('.selectpicker').selectpicker();
        });
      },
      controller: 'ListController',
      controllerAs: 'listCtrl'
    };
}]);
