angular.module('incrowd')
  .controller('InviteCtrl', function ($scope, InviteFactory) {
    $scope.invite = {'invite_url': 'a'};
    $scope.invite_submit = function () {
      console.log('scope invite', $scope.invite);
      console.log('submitting invite request', $scope.formData);
      var create_invite = InviteFactory.create_invite($scope.formData);
      create_invite.then(function (invite) {
        console.log('callback invite', invite);
        $scope.invite = invite;
      })
    };
    $scope.invite = {'invite_url': 'b'};
  });
