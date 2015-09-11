angular.module('PatrimoniTrasparenti')
  .controller('SearchController', function($scope, $compile, $location) {
    searchTarget = {};
    /* config object */
    $scope.myOption = {
        options: {
            html: true,
            focusOpen: true,
            onlySelectValid: true,
            source: function (request, response) {
                var data2 = [
                        "Asp",
                        "BASIC",
                        "C",
                        "C++",
                        "Clojure",
                        "COBOL",
                        "ColdFusion",
                        "Erlang",
                        "Fortran",
                        "Groovy",
                        "Haskell",
                        "Java",
                        "JavaScript",
                        "Lisp",
                        "Perl",
                        "PHP",
                        "Python",
                        "Ruby",
                        "Scala",
                        "Scheme"
                ];
                var data = [
                  {label:"Etichetta", value:"55f1550800241310b2543687"},
                  {label:"Formaggio", value:"55f1550200241310b2543685"}
                ];
                data = $scope.myOption.methods.filter(data, request.term);

                if (!data.length) {
                    data.push({
                        label: 'Non trovato',
                        value: ''
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
                console.log(searchTarget);
                console.log(ui.item.value);
                searchTarget = {};
                $location.path('/scheda/'+ui.item.value);
            }
        },
        methods: {}
    };
  });
