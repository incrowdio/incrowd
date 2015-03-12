angular.module('user_service', [])

.factory('User', function ($http, $interval, $rootScope, BACKEND_SERVER) {
    var Users = {};
    Users.users = [];
    Users.connected_users = [];
    Users.me = '';

    Users.add = function (user) {
      for (var i = 0; i < Users.connected_users.length; i++) {
        if (user.id == Users.connected_users[i].id) {
          console.log('user already connected', user);
          return;
        }
      }
      console.log('adding user', user);
      Users.connected_users.push(user);
    };

    Users.remove = function (user) {
      for (var i = 0; i < Users.connected_users.length; i++) {
        if (user.id == Users.connected_users[i].id) {
          console.log('removing', user);
          Users.connected_users.splice(i, 1);
          break;
        }
      }
    };

    Users.init = function () {
      // Get data on startup
      var username = localStorage.getItem('username');
      Users.promise = $http({
        url: BACKEND_SERVER + 'users/',
        method: 'GET',
        cache: true
      })
        .then(function (res) {
          // Find us
          res.data.results.forEach(function (user) {
            if (user.username == username) {
              Users.me = user;
              console.log('ME!', user);
            }
          });
          Users.users = res.data.results;
          return Users
        });

      // Check in every 15 seconds.
      var check_in = function () {
        //var session_key = localStorage.getItem('session_key');
        $http.post(BACKEND_SERVER + 'check_in\/').success(function (result) {
          console.log('checked in', result);
        });
      };

      $interval(function () {
        check_in()
      }, 60 * 1000);
      check_in();

      $rootScope.$on('pusher:member_added', function (event, data) {
        console.log('adding user', event, data);
        Users.add(data.info);
        console.log('connected users', Users.connected_users);
        $rootScope.$apply();
      });
      $rootScope.$on('pusher:member_removed', function (event, data) {
        console.log('removing user', event, data);
        Users.remove(data.info);
        console.log('connected users', Users.connected_users);
        $rootScope.$apply();
      });
      $rootScope.$on('pusher:subscription_succeeded', function (event, data) {
        console.log('subscription data', data['members']);
        if (data['members']) {
          // NOTE(pcsforeducation) Stupid nonzero indexing..
          for (var key in data['members']) {
            if (data['members'][key]) {
              Users.add(data['members'][key]);
            }
          }
        }

        // TODO(pcsforeducation) fix and use this for user
        //console.log('me set', Channel.presence.members['me']['info']);
        //Users.me = Channel.presence.members['me']['info'];
        //$rootScope.$apply();
      });

    };

    Users.init();
    return Users;
  });