angular.module('incrowd')
  .directive('profile', function () {
    "use strict";
    return {
      restrict: 'E',
      transclue: true,
      templateUrl: 'components/profile/profile.html'
    };
  })
  .controller('ProfileCtrl', function ($http, $scope, $stateParams, $filter, BACKEND_SERVER) {
    "use strict";
    $scope.username = $stateParams.username;
    if ($scope.username === "" || $scope.username === undefined) {
      $http.get(BACKEND_SERVER + 'users\/')
        .then(function (res) {
          $scope.profiles = res.data.results;
        });
    } else {
      $http.get(BACKEND_SERVER + 'users\/' + $scope.username + '\/')
        .then(function (res) {
          $scope.profiles = [res.data];
        });
    }
    $scope.editSave = function (index) {
      var profile = $scope.profiles[index];
      $http.put(BACKEND_SERVER + 'users\/' + profile.username + '\/', profile);
    };

    $scope.statuses = [
      {
        value: 'no',
        text: 'None'
      },
      {
        value: 'all',
        text: 'Posts and Comments'
      },
      {
        value: 'posts',
        text: 'Posts'
      }
    ];

    $scope.showStatus = function (user) {
      var selected = $filter('filter')(
        $scope.statuses, {value: user.email_settings});
      return (user.email_settings && selected.length) ? selected[0].text : 'Not set';
    };
  })
  .controller('UserCtrl', function ($scope, $rootScope, $http, BACKEND_SERVER, Users) {
    // Get data on startup
    "use strict";
    var username = localStorage.getItem('username');
    $http.get(BACKEND_SERVER + 'users/' + username + '\/')
      .then(function (res) {
        $scope.user = res.data;
      });
    $scope.getProfilePic = function (user_id) {
      Users.users.forEach(function (user) {
        if (user.id === user_id) {
          return user.profile_pic;
        }
      });
    };
  })
  .controller('UsersCtrl', function ($scope, $interval, $http, BACKEND_SERVER, Users) {
    "use strict";
    $scope.$watch(function () {
      $scope.users = Users.users;
      $scope.connected_users = Users.connected_users;
    });
  });
