angular.module('incrowd')
  .controller('TabCtrl', function ($scope, $location, $mdSidenav, $state, $rootScope, $http, Users, Config, BACKEND_SERVER, Notifications) {
    "use strict";
    $scope.tabs = [];

    Users.promise.then(function () {
      $scope.crowd = $rootScope.crowd;
    });

    // Highlight current tab
    var find_tab = function () {
      var current_location = $state.current.name;
      if (current_location) {
        $scope.tabs.forEach(function (tab) {
          //NOTE(pcsforeducation) This could give false positives
          tab.highlighted = (current_location.indexOf(tab.link) >= 0);
        });
      }
    };

    Config.tabs.then(function (tabs) {
      $scope.tabs = tabs;
      $scope.alerts = Config.alert_count;
      find_tab();
    });

    // Update highlighted tab when clicked
    //$scope.select = function (item) {
    //  $scope.selected = item;
    //};

    $scope.itemClass = function (item) {
      //if (item.name == 'Chat') {
      //
      //  return 'hide-tab'
      //}
      return item === $scope.selected ? 'active' : undefined;
    };

    // Update highlighted tab
    //$scope.$on('$locationChangeStart', function () {
    //  find_tab();
    //});

    $scope.toggleLeft = function () {
      $mdSidenav('left').toggle();
    };
    $scope.toggleRight = function () {
      $mdSidenav('right').toggle();
    };

    // Init
    //find_tab();
  });
