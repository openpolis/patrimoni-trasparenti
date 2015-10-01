angular.module("PatrimoniTrasparenti")
  .directive("ptCard", function() {
    return {
      restrict: "E",
      scope: {
        opId: "@"
      },
      templateUrl: "templates/directives/pt-card.html",
      controller: 'CardController',
      controllerAs: 'cardCtrl'
    };
});
