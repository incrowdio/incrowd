angular.module("profile", ["djangle"])
  .controller('ProfileCtrl', function ($http, $scope, $stateParams, BACKEND_SERVER) {
    $scope.username = $stateParams.username;
    console.log('profile list username', $scope.username, $stateParams);
    if ($scope.username == "" || $scope.username == undefined) {
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
    console.log('profiles', $scope.profiles);
    $scope.editSave = function (index) {
      var profile = $scope.profiles[index];
      $http.put(BACKEND_SERVER + 'users\/' + profile.username + '\/', profile);
    };

    $scope.log = function (msg) {
      console.log(msg);
    }

  });
