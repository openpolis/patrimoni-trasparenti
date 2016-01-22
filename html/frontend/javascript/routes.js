angular.module('PatrimoniTrasparenti')
  .config(function($routeProvider){
    $routeProvider.when('/', {
    templateUrl: '/templates/pages/home/index.html',
    controller: function($scope, $location, $window) {
      $window.ga('send', 'pageview', { page: $location.url()});
    }
  })
    .when('/faq', {
    templateUrl: '/templates/pages/faq/index.html'
  })
    .when('/progetto', {
    templateUrl: '/templates/pages/progetto/index.html',
    controller: function($scope, $location, $window) {
      $window.ga('send', 'pageview', { page: $location.url()});
    }
  })
    .when('/minidossier', {
    templateUrl: '/templates/pages/minidossier/index.html',
    controller: function($scope, $location, $window) {
      $window.ga('send', 'pageview', { page: $location.url()});
    }
  })
    .when('/opendata', {
    templateUrl: '/templates/pages/opendata/index.html'
  })
    .when('/scheda/:name/:id', {
    templateUrl: '/templates/pages/scheda/index.html',
    controller: function($routeParams) {
      this.opId = $routeParams.id;
    },
    controllerAs: 'cardCtrl'
  })
    .when('/istituzioni/:id', {
    templateUrl: '/templates/pages/istituzioni/index.html',
    controller: function($routeParams) {
      this.istitution = $routeParams.id;
    },
    controllerAs: 'istituzionCtrl'
  })
    .when('/circoscrizioni/:id', {
    templateUrl: '/templates/pages/circoscrizioni/index.html',
    controller: function($routeParams) {
      this.district = $routeParams.id;
    },
    controllerAs: 'districtCtrl'
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
