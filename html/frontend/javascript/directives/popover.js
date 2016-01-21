angular.module("PatrimoniTrasparenti")
  .directive('customPopover', function () {
      return {
          restrict: 'A',
          template: '<span><img src="assets/images/info.png" alt="{{label}}" width="16" height="16" data-src2x="assets/images/info@2x.png"></span>',
          link: function (scope, el, attrs) {
              scope.label = attrs.popoverLabel;

              $(el).popover({
                  trigger: 'click',
                  html: true,
                  content: attrs.popoverHtml,
                  title: attrs.popoverTitle,
                  placement: attrs.popoverPlacement
              });
          }
      };
  });
