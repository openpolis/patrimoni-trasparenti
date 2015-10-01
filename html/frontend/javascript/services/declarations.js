angular.module('PatrimoniTrasparenti')
  .provider('Declarations', function DeclarationsProvider() {
    var apiEndPoint = '';
    this.setEndPoint = function(endPoint) {
      apiEndPoint = endPoint;
    };
    this.$get = function($http) {
      return {
        get: function(id) {
          return $http.get(apiEndPoint + '/dichiarazioni/' + id)
        },
        // Get all declarations for a given politician.
        getFor: function(op_id) {
          return $http.get(apiEndPoint + '/politici/' + op_id)
        },
        getAutocompleteAll: function(query) {
          return $http.get(apiEndPoint + '/autocompleter', {params:{q:query}})
        }
      }
    };
});
