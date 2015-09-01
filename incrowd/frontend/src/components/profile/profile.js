angular.module('incrowd')
  .directive('profile', function ($rootScope, $log, $filter, Users) {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        user: '='
      },
      templateUrl: 'components/profile/profile.html',
      link: function ($scope) {
        $scope.me = $rootScope.me;

        $scope.editSave = function () {
          var index = getIndexById(Users.users, $scope.user.id);
          var user = new Users.resource(Users.users[index]);
          $log.info('Saving user', user);
          user.$save().$promise.then(function (data) {
            $log.info('updated user', data);
          });
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
      }
    };
  })
  .controller('UsersCtrl', function ($scope, $rootScope, Users) {
    "use strict";
    Users.promise.then(function () {
      $scope.users = Users.users;
      $scope.connected_users = Users.connected_users;
      $scope.crowd = $rootScope.crowd;
      $scope.me = $rootScope.me;
    });
  })
  .controller('UserCtrl', function ($scope, $rootScope, $log, $stateParams, Users) {
    "use strict";
    var username = $stateParams.username;
    $log.debug('Getting profile for user', username);
    Users.promise.then(function () {
      $scope.users = [Users.get(username)];
      $scope.connected_users = Users.connected_users;
      $scope.crowd = $rootScope.crowd;
      $scope.me = $rootScope.me;
    });
  });
