angular.module('PatrimoniTrasparenti')
  .controller('CardController', ['$scope', 'Declarations', '$location', '$anchorScroll', function($scope, Declarations, $location, $anchorScroll){
    $scope.selectYear = function(i) {
      $scope.scheda = $scope.schede[i] ;
    };
    $scope.spinner = true;
    $scope.scrollTo = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      //reset to old to keep any additional routing logic from kicking in
      $location.hash(old);
    };
    $scope.selectAndScroll = function(i, id) {
      if (i === -1) {
        // nothing to show, do nothing
        return
      };
      $scope.selectYear(i);
      // FIXME this call has no effect
      $scope.scrollTo(id);
    };
    $scope.isNumber = function(value) {
      return angular.isNumber(value);
    };
    $scope.getLastSpeseYear = function() {
      $scope.lastSpeseYearIndex = -1;
      $scope.lastSpeseYear = 0;
      for (var i in $scope.schede) {
        scheda = $scope.schede[i];
        if (scheda["dichiarazione_elettorale"] != false) {
          $scope.lastSpeseYear = scheda["anno_dichiarazione"];
          $scope.lastSpeseYearIndex = i;
        };
      };
      if ($scope.lastSpeseYear != 0) {
        return "Vedi anno " + $scope.lastSpeseYear;
      } else {
        return "Nessuna voce";
      }
    };
    $scope.getLastContributiYear = function() {
      $scope.lastContributiYearIndex = -1;
      $scope.lastContributiYear = 0;
      for (var i in $scope.schede) {
        scheda = $scope.schede[i];
        if (scheda["dichiarazione_elettorale"] != false) {
          $scope.lastContributiYear = scheda["anno_dichiarazione"];
          $scope.lastContributiYearIndex = i;
        };
      };
      if ($scope.lastContributiYear != 0) {
        return "Vedi anno " + $scope.lastContributiYear;
      } else {
        return "Nessuna voce";
      }
    };
    Declarations.getFor($scope.opId)
      .success(function(schede){
        $scope.spinner = false;
        if (schede[0].anno_dichiarazione === 2015) {
            schede.shift();;
        }
        $scope.schede = schede;
        $scope.scheda = schede[0];
      })
      .catch(function(resp) {
        $scope.spinner = false;
        $scope.errors = true;
      });
  }]);
