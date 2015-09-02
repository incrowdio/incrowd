angular.module('incrowd')
  .controller('SignupCtrl', function ($scope, $http, $log, $location, $state, Users, BACKEND_SERVER, djResource) {
    // TODO(pcsforeducation) Only allow unauthenticated users to register
    "use strict";
    var resource = djResource(BACKEND_SERVER + 'users\/', {});
    $scope.formData = new resource();
    var params = $location.search();
    var invite_code = params.code;
    var email = params.email;
    var crowd = params.crowd;

    // Fill the form with any provided info in the URL params
    $scope.formData.code = invite_code;
    $scope.formData.email = email;
    $scope.formData.crowd = crowd;

    $scope.register = function () {
      $log.debug('Submitting new user', $scope.formData);
      Users.create($scope.formData).then(function (data, status, headers, config) {
        $state.go('login');
      }, function (data, status, headers, config) {
        $log.error('Could not create user');
      });
    };

  });
