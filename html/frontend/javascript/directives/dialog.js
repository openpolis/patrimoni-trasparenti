angular.module("PatrimoniTrasparenti")
  .directive('openDialog', ["$timeout", function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
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
                //console.log(e);
                //console.log(e.currentTarget);
                $(dialogId).dialog('open');
                // FIXME
                //$(dialogId).position({of: e.currentTarget });
            });
        }
    };
}])
