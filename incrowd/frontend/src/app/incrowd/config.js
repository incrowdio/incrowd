angular.module('incrowdLib', [])

  // Default constants
  .constant('INCROWD_EVENTS', {
    'subscribe': 'SUBSCRIPTION_SUCCEEDED',
    'chat': 'chat',
    'post': 'post',
    'comment': 'comment',
    'notification': 'notification'
  })

  .service('Config', function ($http, $q, Notifications, Polls) {
    "use strict";
    var conf = {};

    // Create list of tabs to display
    var tabs_deferred = $q.defer();
    $q.all([
      Polls.get(),
      Notifications.get()
    ]).then(function (data) {
      var tabs = [];

      tabs = [
        {
          'name': 'Posts',
          'state': 'posts',
          'alert': ''
        },
        {
          'name': 'Notifications',
          'state': 'notifications',
          'alert': '',
          'items': Notifications.notifications
        },
        {
          'name': 'Chat',
          'state': 'chat',
          'alert': '',
          'mobile_only': true
        }];
      var last_tabs = [
        {
          'name': 'Users',
          'state': 'users',
          'alert': ''
        }
      ];
      data[0].forEach(function (poll) {
        tabs.push({
          'name': poll.stub,
          'state': 'polls({pollStub: "' + poll.stub + '"})',
          'alert': ''
        });

      });
      tabs = tabs.concat(last_tabs);
      tabs_deferred.resolve(tabs);
    });
    conf.tabs = tabs_deferred.promise;
    conf.alert_count = Notifications.notifications;

    return conf;
  });
