var app = angular.module('incrowd', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngMaterial',
  'infinite-scroll',
  'xeditable',
  'autocomplete',
  'offClick',
  //'luegg.directives',
  'monospaced.elastic',
  'config',
  'auth',
  'pusher_service',
  'signup',
  'profile',
  'chat',
  'notify',
  'poll',
  'post_controllers'
]);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.
    when('/posts', {
      templateUrl: 'templates/posts.html',
      controller: 'PostListCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/posts/:postId', {
      templateUrl: 'templates/post_detail.html',
      controller: 'PostDetailCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'AuthCtrl'
    }).
    when('/chat', {
      templateUrl: 'templates/chat.html',
      controller: 'ChatCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/polls/:pollStub', {
      templateUrl: 'templates/poll.html',
      controller: 'PollDetailCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/notifications', {
      templateUrl: 'templates/notifications.html',
      controller: 'NotificationCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/accounts/signup', {
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
    }).
    when('/invite', {
      templateUrl: 'templates/invite.html',
      controller: 'InviteCtrl'
    }).
    when('/users/:username', {
      templateUrl: 'templates/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).
    when('/users', {
      templateUrl: 'templates/profiles.html',
      controller: 'ProfileListCtrl',
      resolve: {
        'UserData': function (User) {
          return User.promise;
        }
      }
    }).

    otherwise({
      redirectTo: '/posts'
    });
  //    $locationProvider.html5Mode(true);
}

])

  //.config(['msdElasticConfig', function (config) {
  //  config.append = '\n\n';
  //}])

  // Allow loading of YouTube
  .config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://**.youtube.com/**'
    ]);
  })
  // Django CSRF
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  }])

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


app.service('Config', function ($http, $q, Notification, BACKEND_SERVER) {
  var conf = {};

  // Create list of tabs to display
  var tabs_deferred = $q.defer();
  $http.get(BACKEND_SERVER + 'polls/')

    .success(function (res, status, headers, config) {
      var tabs = [];

      tabs = [
        {
          'name': 'Posts',
          'link': '/#/posts',
          'alert': ''
        },
        {
          'name': 'Notifications',
          'link': '/#/notifications',
          'alert': '',
          'items': Notification.notifications
        },
        {
          'name': 'Chat',
          'link': '/#/chat',
          'alert': '',
          'mobile_only': true
        }];
      var last_tabs = [
        {
          'name': 'Users',
          'link': '/#/users',
          'alert': ''
        }
      ];
      res.forEach(function (poll) {
        tabs.push({
          'name': poll.stub,
          'link': '/#/polls/' + poll.stub,
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

app.run(function ($rootScope, $http, $location) {
  if (localStorage.getItem('token')) {
    $http.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem('token');
    $rootScope.loggedIn = true;
  } else {
    $rootScope.loggedIn = false;
  }
  $rootScope.$watch(function () {
    return $location.path();
  }, function (newValue, oldValue) {
    var no_auth_urls = ['/login', '/accounts/signup'];
    if ($rootScope.loggedIn == false && no_auth_urls.indexOf(newValue) == -1) {
      $location.path('/login');
    }
  });
});

app.run(function (User) {
});

app.run(function (Channel) {
});

app.run(function (Config) {

});


function urlify(text) {
  var expression = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

  var regex = new RegExp(expression);
  var t = 'www.google.com';
  return text.replace(regex, function (url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

function highlight(text, highlight_text) {
  text = text.insert(text.indexOf(highlight_text) - 1, '<span class="highlight">');
  return text.insert(text.indexOf(highlight_text) + highlight_text.length, '</span>');

}

// Add insert so we can add highlights easily.
String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};
