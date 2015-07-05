angular.module('incrowd')
  .controller('TabCtrl', function ($scope, $location, $mdSidenav, $http, Config, BACKEND_SERVER, Notifications) {
    Config.tabs.then(function (tabs) {
      $scope.tabs = tabs;
      $scope.alerts = Config.alert_count;
    });

    // Highlight current tab
    //var find_tab = function () {
    //  var current_location = "/#" + $location.path();
    //  $scope.tabs.forEach(function (tab) {
    //    // NOTE(pcsforeducation) This could give false positives
    //    tab.highlighted = (current_location.indexOf(tab.link) >= 0);
    //    return;
    //  });
    //};

    // Update highlighted tab when clicked
    $scope.select = function (item) {
      $scope.selected = item;
    };

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
  })
