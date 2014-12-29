angular.module("profile", ["djangle"])
  .controller('ProfileCtrl', ['$scope', '$http', '$routeParams', 'Form', 'BACKEND_SERVER', function ($scope, $http, $routeParams, Form, BACKEND_SERVER) {
    $scope.username = $routeParams.username;
    $http.get(BACKEND_SERVER + 'users\/' + $scope.username + '\/')
      .then(function (res) {
        $scope.profile = res.data;
      });

    $scope.editSave = function (index) {
      $http.put(BACKEND_SERVER + 'users\/' + $scope.profile.username + '\/', $scope.profile);
    }
  }])

  .controller('ProfileListCtrl', function ($http, $scope, BACKEND_SERVER) {
    $http.get(BACKEND_SERVER + 'users\/')
      .then(function (res) {
        $scope.profiles = res.data.results;
      });

    $scope.editSave = function (index) {
      var profile = $scope.profiles[index];
      $http.put(BACKEND_SERVER + 'users\/' + profile.username + '\/', profile);
    };

    $scope.log = function (msg) {
      console.log(msg);
    }

  });
