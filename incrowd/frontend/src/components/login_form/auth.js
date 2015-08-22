angular.module('incrowd')
  .controller('AuthCtrl', function ($scope, $rootScope, $location, $window, $state, httpInterceptor, api, Auth, BACKEND_SERVER) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      console.log('logging in', credentials);
      Auth.setCredentials(credentials).then(function () {
        console.log('credentials set', $rootScope.loggedIn);
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
