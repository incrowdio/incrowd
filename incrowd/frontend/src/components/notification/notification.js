angular.module('incrowd')
  .controller('NotificationCtrl', function ($scope, $rootScope, $http, $location, Notifications) {
    $scope.notifications = [];
    $scope.notifications = Notifications.notifications;
    $scope.remove_all = function () {
      Notifications.remove_all();
      $scope.notifications = Notifications.notifications;
    };
    $scope.remove_notification = function (item) {
      Notifications.remove_notification(item);
    };
    // Remove notifications if we open to a page in notifications
    Notifications.clear_for_url($location.url());

  });
