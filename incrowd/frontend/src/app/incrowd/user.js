angular.module('incrowdLib')
  .service('Users', function ($q, $log, $rootScope, $interval, BACKEND_SERVER, djResource) {
    "use strict";

    var Users = {}, deferred = $q.defer();

    Users.promise = deferred.promise;

    Users.users = [];
    Users.username = localStorage.getItem('username');
    $rootScope.me = {};
    Users.resource = djResource(BACKEND_SERVER + 'users\/:username\/', {
      username: '@username'
    });
    Users.checkInResource = djResource(BACKEND_SERVER + 'check_in\/');

    Users.resource.query().$promise.success(function (data) {
      Users.users = data.results;

      // Find me
      Users.users.forEach(function (user) {
        if (user.username === Users.username) {
          $rootScope.me = user;
          $rootScope.crowd = user.crowd;
          $log.debug('Found myself!', $rootScope.me, $rootScope.crowd);
        }
      });

      deferred.resolve(Users.users);
      //$rootScope.$apply();
    }).error(function () {
      deferred.reject();
    });

    //Users.add = function (user) {
    //  for (var i = 0; i < Users.connected_users.length; i++) {
    //    if (user.id == Users.connected_users[i].id) {
    //      console.log('user already connected', user);
    //      return;
    //    }
    //  }
    //  console.log('adding user', user);
    //  Users.connected_users.push(user);
    //};
    //
    //Users.remove = function (user) {
    //  for (var i = 0; i < Users.connected_users.length; i++) {
    //    if (user.id == Users.connected_users[i].id) {
    //      console.log('removing', user);
    //      Users.connected_users.splice(i, 1);
    //      break;
    //    }
    //  }
    //};

    Users.checkIn = function () {
      var r = new Users.checkInResource();
      r.$save().$promise.then(function() {
        $log.debug('checked in');
      });
    };

    // Check in every 15 seconds.
    $interval(function () {
      Users.checkIn();
    }, 60 * 1000);
    Users.checkIn();

    $rootScope.$on('pusher:member_added', function (event, data) {
      $log.debug('adding user', event, data);
      Users.add(data.info);
      $log.debug('connected users', Users.connected_users);
      $rootScope.$apply();
    });
    $rootScope.$on('pusher:member_removed', function (event, data) {
      $log.debug('removing user', event, data);
      Users.remove(data.info);
      $log.debug('connected users', Users.connected_users);
      $rootScope.$apply();
    });
    $rootScope.$on('pusher:subscription_succeeded', function (event, data) {
      $log.debug('subscription data', data.members);
      if (data.members) {
        // NOTE(pcsforeducation) Stupid nonzero indexing..
        for (var key in data.members) {
          if (data.members.key) {
            Users.add(data.members.key);
          }
        }
      }

      // TODO(pcsforeducation) fix and use this for user
      //console.log('me set', Channel.presence.members['me']['info']);
      //Users.me = Channel.presence.members['me']['info'];
      //$rootScope.$apply();
    });

    return Users;
  });
