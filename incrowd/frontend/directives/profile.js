angular.module('profile')
  .directive('profile', function () {
    return {
      restrict: 'E',
      transclue: true,
      templateUrl: 'partials/profile.html'
    }
  })

  .directive('profilePic', function (User) {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        id: '=',
        displayUsername: '='
      },
      templateUrl: 'partials/profile_pic.html',
      link: function (scope, element, attrs) {
        scope.displayusername = (attrs.displayusername != undefined);
        User.users.forEach(function (user) {
          if (user.id == scope.id) {
            scope.profile_pic = user.profile_pic;
            scope.username = user.username;
          }
        });
      }
    }
  });
