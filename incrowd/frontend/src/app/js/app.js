var app = angular.module('incrowd', [
  'ngCookies',
  'ngResource',
  'ui.router',
  'ngSanitize',
  'ngMaterial',
  'infinite-scroll',
  'xeditable',
  //'autocomplete',
  'offClick',
  //'luegg.directives',
  'monospaced.elastic',
  'ngEmbed',
  'djangoRESTResources',
  'drf_auth.token',
  'djangle',
  'incrowdLib',
  'config',
  'pusher_service'
])

  .config(function ($stateProvider, $urlRouterProvider) {
    "use strict";
    $urlRouterProvider.otherwise('/posts');

    $stateProvider
      .state('posts', {
        url: '/posts',
        templateUrl: 'templates/posts.html',
        controller: 'PostListCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('post_details', {
        url: '/posts/{postId}',
        templateUrl: 'templates/post_detail.html',
        controller: 'PostDetailCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl'
      })
      .state('chat', {
        url: '/chat',
        templateUrl: 'templates/chat.html',
        controller: 'ChatCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('polls', {
        url: '/polls/:pollStub',
        templateUrl: 'templates/poll.html',
        controller: 'PollDetailCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('notifications', {
        url: '/notifications',
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('signup', {
        url: '/accounts/signup',
        templateUrl: 'templates/signup.html',
        controller: 'SignupCtrl'
      })
      .state('invite', {
        url: '/invite',
        templateUrl: 'templates/invite.html',
        controller: 'InviteCtrl'
      })
      .state('users', {
        url: '/users',
        templateUrl: 'templates/profiles.html',
        controller: 'ProfileCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('users_details', {
        url: '/user/:username',
        templateUrl: 'templates/profiles.html',
        controller: 'ProfileCtrl',
        resolve: {
          'UserData': function (Users) {
            return Users.promise;
          }
        }
      })
      .state('users.reset_password', {
        url: '/users/reset_password',
        templateUrl: 'templates/reset_password.html',
        controller: 'ProfileCtrl'
      });
  })

// Allow loading of YouTube
  .config(function ($sceDelegateProvider) {
    "use strict";
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://**.youtube.com/**',
      'http://i.imgur.com/**'
    ]);
  })

  // Django CSRF
  .config(['$httpProvider', function ($httpProvider) {
    "use strict";
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  }])


  .run(function ($rootScope, $http, $log, Auth, Users, Channel, Config) {
    "use strict";
    if (localStorage.getItem('token')) {
      $http.defaults.headers.common.Authorization = 'Token ' + localStorage.getItem('token');
      $rootScope.loggedIn = true;
    } else {
      $rootScope.loggedIn = false;
    }

    // Watch state changes, check if authed, if not, redirect to login
    $rootScope.$on('$stateChangeStart', function (e, toState) {
      $log.debug('state change start');
      var noAuthStates = ['login', 'signup', 'user.reset_password'];
      Auth.checkStateChange(e, toState, noAuthStates);
    });

    // Set global ngEmbed config
    $rootScope.ngembedOptions = {
      link: true,      //convert links into anchor tags
      linkTarget: '_self',   //_blank|_self|_parent|_top|framename
      pdf: {
        embed: true                 //to show pdf viewer.
      },
      image: {
        embed: false                //to allow showing image after the text gif|jpg|jpeg|tiff|png|svg|webp.
      },
      audio: {
        embed: true                 //to allow embedding audio player if link to
      },
      code: {
        highlight: true,        //to allow code highlighting of code written in markdown
        //requires highligh.js (https://highlightjs.org/) as dependency.
        lineNumbers: false        //to show line numbers
      },
      basicVideo: false,     //to allow embedding of mp4/ogg format videos
      gdevAuth: 'xxxxxxxx', // Google developer auth key for youtube data api
      video: {
        embed: false,    //to allow youtube/vimeo video embedding
        width: null,     //width of embedded player
        height: null,     //height of embedded player
        ytTheme: 'dark',   //youtube player theme (light/dark)
        details: false    //to show video details (like title, description etc.)
      },
      tweetEmbed: false,
      tweetOptions: {
        //The maximum width of a rendered Tweet in whole pixels. Must be between 220 and 550 inclusive.
        maxWidth: 550,
        //When set to true or 1 links in a Tweet are not expanded to photo, video, or link previews.
        hideMedia: false,
        //When set to true or 1 a collapsed version of the previous Tweet in a conversation thread
        //will not be displayed when the requested Tweet is in reply to another Tweet.
        hideThread: false,
        //Specifies whether the embedded Tweet should be floated left, right, or center in
        //the page relative to the parent element.Valid values are left, right, center, and none.
        //Defaults to none, meaning no alignment styles are specified for the Tweet.
        align: 'none',
        //Request returned HTML and a rendered Tweet in the specified.
        //Supported Languages listed here (https://dev.twitter.com/web/overview/languages)
        lang: 'en'
      },
      twitchtvEmbed: true,
      dailymotionEmbed: true,
      tedEmbed: true,
      dotsubEmbed: true,
      liveleakEmbed: true,
      soundCloudEmbed: true,
      soundCloudOptions: {
        height: 160, themeColor: 'f50000',   //Hex Code of the player theme color
        autoPlay: false,
        hideRelated: false,
        showComments: true,
        showUser: true,
        showReposts: false,
        visual: false,         //Show/hide the big preview image
        download: false          //Show/Hide download buttons
      },
      spotifyEmbed: true,
      codepenEmbed: true,        //set to true to embed codepen
      codepenHeight: 300,
      jsfiddleEmbed: true,        //set to true to embed jsfiddle
      jsfiddleHeight: 300,
      jsbinEmbed: true,        //set to true to embed jsbin
      jsbinHeight: 300,
      plunkerEmbed: true,        //set to true to embed plunker
      githubgistEmbed: true,
      ideoneEmbed: true,        //set to true to embed ideone
      ideoneHeight: 300
    };
  });

function DialogController($scope, $mdDialog) {
  "use strict";
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.answer = function (answer) {
    $mdDialog.hide(answer);
  };
}
