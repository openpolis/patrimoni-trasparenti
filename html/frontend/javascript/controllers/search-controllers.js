angular.module('PatrimoniTrasparenti')
  .controller('SearchController', ['$scope', '$compile', '$location', function($scope, $compile, $location) {
    this.searchObj = {id:'', value:''};
    controller = this;
    /* config object */
    $scope.myOption = {
        options: {
            html: true,
            focusOpen: true,
            onlySelectValid: true,
            source: function (request, response) {
                var data = [
                  {value:"Mario Rossi 2014", id:"55f1550800241310b2543687"},
                  {value:"Giorgia Meloni 2014", id:"55f1550200241310b2543685"}
                ];
                data = $scope.myOption.methods.filter(data, request.term);

                if (!data.length) {
                    data.push({
                        value: 'Non trovato',
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
