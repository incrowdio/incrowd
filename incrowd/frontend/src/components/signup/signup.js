angular.module('incrowd')
  .controller('SignupCtrl', function ($scope, $http, $log, $location, $state, Users, BACKEND_SERVER) {
    // TODO(pcsforeducation) Only allow unauthenticated users to register
    "use strict";
    $scope.formData = new Users.resource();

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
      $scope.formData.$save().$promise.success(function (data, status, headers, config) {
        $log.debug('User creation worked', data);
        $state.go('login');
      }).error(function (data, status, headers, config) {
        $log.error('Error creating user');
        //$log.error('error creating user', data);
        //$scope.status = status + ' ' + headers;
      });
    };

  });
