angular.module('PatrimoniTrasparenti')
  .controller('SearchController', ['$scope', '$compile', '$location', 'Declarations', function($scope, $compile, $location, Declarations) {
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
                controller.spinner = true;
                //console.log("making req to autocompl, spinner and $scope:", $scope.Spinner, $scope)
                console.log("req:", request)
                Declarations.getAutocompleteAll(request.term)
                  .success(function(rData){
                    controller.spinner = false;
                    if (!rData.length) {
                        rData.push({
                            value: 'Non trovato, digita un termine completo',
                            id: ''
                        });
                    }
                    response(rData);
                  });
                data = $scope.myOption.methods.filter(data, request.term);

                if (!data.length) {
                    data.push({
                        value: 'Non trovato, digita un termine completo',
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
                $location.path('/scheda/'+ui.item.id);
            },
            close: function( event, ui ) {
                console.log("closed!");
                console.log('searchObj:', controller.searchObj);
                console.log(ui.item);
            }
        },
        methods: {}
    };
  }]);
