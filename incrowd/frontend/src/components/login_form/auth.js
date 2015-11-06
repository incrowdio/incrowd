angular.module('incrowd')
  .controller('LoginCtrl', function ($scope, $rootScope, $location, $window, $state, $log, Auth) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      $log.debug('logging in', credentials);
      Auth.setCredentials(credentials).then(function () {
        $log.debug('credentials set', $rootScope.loggedIn);
        $state.go('posts');
        $window.location.reload();
      });
    };
    $scope.loggedIn = $rootScope.loggedIn;
    if ($scope.loggedIn === true) {
      $state.go('posts');
    }
  })
  .controller('LogoutCtrl', function ($scope, $rootScope, $location, $window, $state, $log, Auth) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.logout = function () {
      Auth.clearCredentials();
      $state.go('login');
    };
    $scope.loggedIn = $rootScope.loggedIn;
    if ($scope.loggedIn === true) {
      $state.go('posts');
    }
  });
