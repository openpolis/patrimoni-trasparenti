angular.module('PatrimoniTrasparenti')
  .provider('Declarations', function DeclarationsProvider() {
    var apiEndPoint = '';
    this.setEndPoint = function(endPoint) {
      apiEndPoint = endPoint;
    };
    this.$get = function($http) {
      return {
        get: function(id) {
          return $http.get(apiEndPoint + id)
        }
      }
    };
});
