angular.module('PatrimoniTrasparenti')
  .controller('SearchController', ['$scope', '$compile', '$location', '$filter', 'Declarations', function($scope, $compile, $location, $filter, Declarations) {
    this.searchObj = {id:'', value:''};
    var controller = this;
    controller.spinner = false;
    /* config object */
    $scope.myOption = {
        options: {
            html: true,
            focusOpen: true,
            onlySelectValid: true,
            source: function (request, response) {
                var data = [];
                //console.log("making req to autocompl, spinner and $scope:", $scope.Spinner, $scope)
                console.log("req:", request)
                // Do not make remote call if term is too short.
                if (request.term.length < 2) {
                  rData = [];
                  rData.push({
                      value: 'Digita almeno 2 lettere',
                      id: ''
                  });
                  response(rData);
                  return;
                };
                controller.spinner = true;
                Declarations.getAutocompleteAll(request.term)
                  .success(function(rData){
                    controller.spinner = false;
                    for (var i in rData) {
                      rData[i].label = $compile(
                      '<p><img class="autocompleter-img" ng-src="http://politici.openpolis.it/politician/picture?content_id='+rData[i].id+'"/> '+
                      $filter('capitalize')(rData[i].value, 'all') +
                      '</p>'
                      )($scope)
                    };
                    if (!rData.length) {
                        rData.push({
                            value: 'Non trovato',
                            id: ''
                        });
                    }
                    response(rData);
                  });
                data = $scope.myOption.methods.filter(data, request.term);

                if (!data.length) {
                    data.push({
                        value: 'Ricerca in corso...',
                        id: ''
                    });
                }
                // add "Add Language" button to autocomplete menu bottom
                //data.push({
                //    label: $compile('<a class="btn btn-link ui-menu-add" ng-click="addLanguage()">Add Language</a>')($scope),
                //    value: ''
                //});
                response(data);
            }
        },
        events : {
            select: function( event, ui ) {
                console.log("selected!");
                console.log(controller.searchObj);
                console.log('ui:', ui);
                console.log(ui.item);
                if ('acronym' in ui.item) {
                  $location.path('/gruppo/'+ui.item.acronym);
                } else if ('istitution' in ui.item) {
                  $location.path('/istituzioni/'+ui.item.istitution);
                } else {
                  $location.path('/scheda/'+ui.item.id);
                };
            },
            close: function( event, ui ) {
                console.log("closed!");
                console.log('searchObj:', controller.searchObj);
            }
        },
        methods: {}
    };

    // My definitions
    controller.search = function() {
      console.log("searchObj when clicked:", this.searchObj["value"]);
    };
  }]);
