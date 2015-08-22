angular.module('incrowd')
  .controller('AuthCtrl', function ($scope, $rootScope, $location, $window, $state, $log, httpInterceptor, api, Auth, BACKEND_SERVER) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      $log.debug('logging in', credentials);
      Auth.setCredentials(credentials).then(function () {
        $log.debug('credentials set', $rootScope.loggedIn);
        $state.go('login');
        $window.location.reload();
      });
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
