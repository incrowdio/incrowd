angular.module('incrowd')
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav) {
    "use strict";
    $scope.close = function () {
      $mdSidenav('left').close();
    };
  })

  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav) {
    "use strict";
    $scope.close = function () {
      $mdSidenav('right').close();
    };
  });
