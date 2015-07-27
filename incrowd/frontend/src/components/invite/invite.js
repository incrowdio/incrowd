angular.module('incrowd')
  .controller('InviteCtrl', function ($scope, Invites) {
    "use strict";

    $scope.formData = new Invites.resource();

    $scope.inviteSubmit = function () {
      Invites.create($scope.formData).then(function () {
        $scope.formData = new Invites.resource();
      });
    };
  });
