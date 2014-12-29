angular.module("profile", ["djangle"])
  .controller('ProfileCtrl', ['$scope', '$http', '$routeParams', 'Form', 'BACKEND_SERVER', function ($scope, $http, $routeParams, Form, BACKEND_SERVER) {
    $scope.username = $routeParams.username;
    console.log('profile ctrl', $scope.username);
    $http.get(BACKEND_SERVER + 'users\/' + $scope.username + '\/')
      .then(function (res) {
        console.log('profiles', res);
        $scope.profile = res.data;
      });

    $scope.editSave = function(index) {
      console.log('profiles', $scope.profile, index);
      $http.put(BACKEND_SERVER + 'users\/' + $scope.profile.username + '\/', $scope.profile);
    }
  }])
  .controller('ProfileListCtrl', function ($http, $scope, BACKEND_SERVER) {
    console.log('profileslistctrl');
    $http.get(BACKEND_SERVER + 'users\/')
      .then(function (res) {
        console.log('profiles', res);
        $scope.profiles = res.data.results;
      });

    $scope.editSave = function(index) {
      console.log('profiles', $scope.profiles, index);
      var profile = $scope.profiles[index];
      $http.put(BACKEND_SERVER + 'users\/' + profile.username + '\/', profile);
    }

  });
