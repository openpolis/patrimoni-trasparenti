angular.module("PatrimoniTrasparenti")
  .directive('customPopover', ["$timeout", function ($timeout) {
      return {
          restrict: 'A',
          template: '<span><img src="assets/images/info.png" alt="{{label}}" width="16" height="16" data-src2x="assets/images/info@2x.png"></span>',
          link: function (scope, el, attrs) {
              scope.label = attrs.popoverLabel;
              $timeout(function(){
                $(el).popover({
                    trigger: 'click',
                    html: true,
                    content: attrs.popoverHtml,
                    title: attrs.popoverTitle,
                    placement: attrs.popoverPlacement
                });
                // Close popover when click everywhere on
                // the page.
                // FIXME this introduce "double click to open popoover" bug
                $('html').on('mouseup', function(e) {
                    if(!$(e.target).closest('.popover').length) {
                        $('.popover').each(function(){
                            $(this.previousSibling).popover('hide');
                        });
                    }
                });
              });
          }
      };
  }]);
