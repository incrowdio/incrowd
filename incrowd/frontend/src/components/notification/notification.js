angular.module('incrowd')
  .directive('notification', function ($state, Notifications) {
    "use strict";

    return {
      restrict: 'E',
      scope: {
        notification: '='
      },
      //replace: true,
      templateUrl: 'components/notification/notification.html',
      link: function ($scope) {
        var icons = {
          'chat': 'icon-chat_bubble icomoon',
          'comment': 'icon-comment icomoon',
          undefined: 'icon-notifications_none icomoon'
        };

        $scope.remove = function (item) {
          Notifications.remove(item);
        };
        $scope.notificationIcon = function (item) {
          return icons[item.type];
        };
        $scope.goTo = function (item) {
          $scope.remove(item);
          if (item.type === 'comment') {
            $state.go('post_details', {postId: item.identifier});
          }
          else if (item.type === 'chat') {
            $state.go('chat');
          }
        };
      }
    };
  })
  .controller('NotificationCtrl', function ($scope, $rootScope, $http, $location, Notifications) {
    "use strict";
    Notifications.promise.then(function () {
      $scope.notifications = Notifications.notifications;
    });

    $scope.remove_all = function () {
      Notifications.remove_all();
    };

    // Remove notifications if we open to a page in notifications
    Notifications.clear_for_url($location.url());

  });
