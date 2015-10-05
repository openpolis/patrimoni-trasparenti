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
      this.opId = $routeParams.id;
    },
    controllerAs: 'cardCtrl'
  })
    .when('/istituzione/:id', {
    templateUrl: '/templates/pages/istituzione/index.html',
    controller: function($routeParams) {
      this.istitution = $routeParams.id;
    },
    controllerAs: 'istituzionCtrl'
  })
    .when('/gruppo/:acronym', {
    templateUrl: '/templates/pages/gruppo/index.html',
    controller: function($routeParams) {
      this.acronym = $routeParams.acronym;
    },
    controllerAs: 'gruppoCtrl'
  })
    .otherwise({ redirectTo: '/' });

});
