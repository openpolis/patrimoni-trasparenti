angular.module("PatrimoniTrasparenti")
  .directive('openDialog', ["$timeout", function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            console.log("here");
            var dialogId = '#' + attr.openDialog;
            $(dialogId).dialog({
              position: { my: "center top", at: "top bottom", of: elem },
              autoOpen: false,
              modal: true,
              resizable: false
            });
            elem.bind('click', function(e) {
                $(dialogId).dialog('open');
                // FIXME
                //$(dialogId).position({ my: "center top", at: "top bottom", of: e });
            });
        }
    };
}])
