angular.module("PatrimoniTrasparenti")
  .directive('openDialog', ["$timeout", function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            console.log("here");
            var dialogId = '#' + attr.openDialog;
            $timeout(function(){
                //position: { my: "center top", at: "top bottom", of: elem },
              $(dialogId).dialog({
                autoOpen: false,
                modal: true,
                resizable: false
              });
            });
            elem.bind('click', function(e) {
                $(dialogId).dialog('open');
            });
        }
    };
}])
