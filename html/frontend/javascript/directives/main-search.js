angular.module("PatrimoniTrasparenti")
  .directive("mainSearch", function() {
    return {
      restrict: "E",
      scope: {},
      templateUrl: "templates/directives/main-search.html",
      controller: 'CardController',
      controllerAs: 'cardCtrl'
    };
});
