angular.module("PatrimoniTrasparenti")
.directive("ptCard", function() {
  return {
    restrict: "E",
    scope: {
      declarationId: "@"
    },
    templateUrl: "templates/directives/pt-card.html",
    controller: 'CardController',
    controllerAs: 'cardCtrl'
  };
});
