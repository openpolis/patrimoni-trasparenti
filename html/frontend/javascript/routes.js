angular.module('PatrimoniTrasparenti')
  .config(function($routeProvider){
    $routeProvider.when('/', {
    templateUrl: '/templates/pages/home/index.html'
  })
    .when('/faq', {
    templateUrl: '/templates/pages/faq/index.html'
  })
    .when('/scheda/:id', {
    templateUrl: '/templates/pages/scheda/index.html',
    controller: function($routeParams) {
      this.declarationId = $routeParams.id;
    },
    controllerAs: 'cardPageController'
  })
    .otherwise({ redirectTo: '/' });

});