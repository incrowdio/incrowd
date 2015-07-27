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
  });
