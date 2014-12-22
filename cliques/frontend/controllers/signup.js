angular.module('signup', [])
  .controller('SignupCtrl', ['$scope', '$http', '$location', 'BACKEND_SERVER', function ($scope, $http, $location, BACKEND_SERVER) {
    // TODO(pcsforeducation) Only allow unauthenticated users to register
    $scope.formData = {};

    var params = $location.search();
    // Set defaults for server if BACKEND_SERVER config isn't set
    var server = BACKEND_SERVER == undefined ? '/' : BACKEND_SERVER;
    var invite_code = params.code;
    var email = params.email;

    // Fill the form with any provided info in the URL params
    $scope.formData['code'] = invite_code;
    $scope.formData['email'] = email;

    $scope.register = function () {
//      console.log("submitting registration", $scope.formData);
      $http({
        //url: server + 'register\/',
        url: BACKEND_SERVER + 'register',
        method: "POST",
        data: $.param($scope.formData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (data, status, headers, config) {
        $location.path('/#/login').replace();
      }).error(function ($scope, data, status, headers, config) {
        console.log('error', data);
        $scope.status = status + ' ' + headers;
      });
    };

  }]);