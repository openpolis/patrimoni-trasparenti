angular.module('PatrimoniTrasparenti')
  .provider('Declarations', function DeclarationsProvider() {
    var apiEndPoint = '';
    this.setEndPoint = function(endPoint) {
      apiEndPoint = endPoint;
    };
    this.$get = function($http) {
      return {
        get: function(id) {
          return $http.get(apiEndPoint + '/p/dichiarazioni/' + id)
        },
        getAutocompleteAll: function() {
          return $http.get(apiEndPoint + '/autocompleter')
        }
      }
    };
});
