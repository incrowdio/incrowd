angular.module('pusher_service', [])

  .factory('Channel', function ($rootScope, $http, BACKEND_SERVER, PUSHER_CHANNEL, PUSHER_APP_KEY, PUSHER_PRESENCE) {
    var Notifications = {};
    Notifications.pusher = new Pusher(PUSHER_APP_KEY, {
      auth: {
        headers: {'Authorization': 'Token ' + localStorage.getItem('token')}
      }
    });
    Notifications.channel = Notifications.pusher.subscribe(PUSHER_CHANNEL);
    Notifications.presence = Notifications.pusher.subscribe(PUSHER_PRESENCE);
    Notifications.stream = [];

    var messageCallback = function (type, data) {
      // Call back on every Channel message. Broadcast out with type to
      // listeners
      data = angular.fromJson(data);

      if (data) {
        if (type == 'pusher:subscription_error') {
          // TODO(pcsforeducation) Handle this better
          console.log('Could not subscribe', data);
          return;
        }
        else if (type == 'pusher:subscription_succeeded') {
          $rootScope.$broadcast(type, Notifications.presence.members);
        }
        console.log('Broadcasting', type, data);
        $rootScope.$broadcast(type, angular.fromJson(data));
      }
    };

    // Bind to all messages on our channels
    Notifications.channel.bind_all(messageCallback);
    Notifications.presence.bind_all(messageCallback);
    console.log('channel members', Notifications.presence.members);

    return Notifications;
  })