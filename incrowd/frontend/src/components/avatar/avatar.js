angular.module('incrowd')
  .directive('avatar', function () {
    "use strict";

    return {
      restrict: 'E',
      scope: {
        user: '='
      },
      templateUrl: 'components/avatar/avatar.html'
    };
  })
  .directive('backImg', function () {
    "use strict";

    return function (scope, element, attrs) {
      var url = attrs.backImg;
      element.css({
        'background-image': 'url(' + url + ')',
      });
    };
  });
