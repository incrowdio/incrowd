angular.module('config_service', [])

.service('Config', function ($http, $q, Notification, BACKEND_SERVER) {
  var conf = {};

  // Create list of tabs to display
  var tabs_deferred = $q.defer();
  $http.get(BACKEND_SERVER + 'polls/')

    .success(function (res, status, headers, config) {
      var tabs = [];

      tabs = [
        {
          'name': 'Posts',
          'link': '#/posts',
          'alert': ''
        },
        {
          'name': 'Notifications',
          'link': '#/notifications',
          'alert': '',
          'items': Notification.notifications
        },
        {
          'name': 'Chat',
          'link': '#/chat',
          'alert': '',
          'mobile_only': true
        }];
      var last_tabs = [
        {
          'name': 'Users',
          'link': '#/users',
          'alert': ''
        }
      ];
      res.forEach(function (poll) {
        tabs.push({
          'name': poll.stub,
          'link': '#/polls/' + poll.stub,
          'alert': ''
        });

      });
      tabs = tabs.concat(last_tabs);
      tabs_deferred.resolve(tabs);
    });
  conf.tabs = tabs_deferred.promise;
  conf.alert_count = Notification.notifications;

  return conf;
});