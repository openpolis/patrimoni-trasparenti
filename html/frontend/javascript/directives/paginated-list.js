angular.module("PatrimoniTrasparenti")
  .directive("ptList", function() {
    return {
      restrict: "E",
      scope: {
        type: "@",
        key: "@"
      },
      templateUrl: "templates/directives/pt-list.html",
      controller: 'ListController',
      controllerAs: 'listCtrl'
    };
});
