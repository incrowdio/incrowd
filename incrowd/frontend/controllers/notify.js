angular.module('notify', [])
  .controller('NotificationCtrl', function ($scope, $rootScope, $http, $location, Notification, BACKEND_SERVER) {
    $scope.notifications = [];
    $scope.notifications = Notification.notifications;
    $scope.remove_all = function () {
      Notification.remove_all();
      $scope.notifications = Notification.notifications;
    };
    $scope.remove_notification = function (item) {
      Notification.remove_notification(item);
    };
    // Remove notifications if we open to a page in notifications
    Notification.clear_for_url($location.url());

  })
  .factory('Notification', function ($http, $rootScope, $timeout, $location, User, BACKEND_SERVER) {
    var Notifications = {};
    Notifications.notifications = [];

    Notifications.remove_all = function () {
      for (var i = 0; i < Notifications.notifications.length; i++) {
        var item = Notifications.notifications[i];
        $http.delete(BACKEND_SERVER + 'notifications/' + item.id + '\/');
      }
      Notifications.notifications.splice(0, Notifications.notifications.length + 1);
    };

    Notifications.remove_notification = function (item) {
      $http.delete(BACKEND_SERVER + 'notifications/' + item.id + '\/')
        .success(function (res) {
          for (var i = 0; i < Notifications.notifications.length; i++) {
            if (Notifications.notifications[i].id == item.id) {
              Notifications.notifications.splice(i, 1);
              break;
            }
          }
        });
    };

    // Listen for location changes, remove notifications if user sees page that
    // they were notified about changes on
    $rootScope.$on('$locationChangeSuccess', function (event) {
      Notifications.clear_for_url($location.url())
    });

    Notifications.clear_for_url = function (url) {
      Notifications.notifications.forEach(function (n) {
        console.log('checking for clear on ', url, n.link);
        if (url == n.link) {
          console.log('Deleting notification because you\'re on the page ', n);
          Notifications.remove_notification(n);
        }
      });
    };

    // Get the first page of results
    $http.get(BACKEND_SERVER + 'notifications\/').success(function (results) {
      results.results.forEach(function (n) {
        // Delete any notifications for the current page
        if ($location.url() == n.link) {
          console.log('Got notification for current page, deleting', n);
          Notifications.remove_notification(n);
        } else {
          Notifications.notifications.push(n);
        }
      });
    });

    // Listen to Channel updates for notifications
    $rootScope.$on('notify', function (event, message) {
      console.log('new notification', message)
      if (message.user == User.me.id) {
        Notifications.notifications.push(message);
        $rootScope.$apply();
      }
    });

    return Notifications
  })