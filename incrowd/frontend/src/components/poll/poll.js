angular.module('incrowd')
  .controller('PollDetailCtrl', function ($scope, $q, $rootScope, $http, $stateParams, $location, Users, Polls) {
    "use strict";
    $scope.pollStub = $stateParams.pollStub;
    $scope.formData = new Polls.Submissions.resource();


    $scope.submit = function () {
      Polls.Submissions.create($scope.formData, $scope.pollStub).then(function () {
        $scope.submissions = Polls.Submissions.resource.query();
        $scope.formData = new Polls.Submissions.resource();
      });
    };

    $q.all([
      Polls.Submissions.get(),
      Polls.Votes.get()
    ]).then(function (data) {
      $scope.submissions = data[0];
      $scope.votes = data[1];

      // Could probably be faster with a filter or something. O(n^2)
      var i, j, vote, submission;
      for (i = 0; i < $scope.votes.length; i++) {
        vote = $scope.votes[i];
        for (j = 0; j < $scope.submissions.length; j++) {
          submission = $scope.submissions[j];
          if (vote.submission === submission.id) {
            submission.voted = true;
            submission.vote = vote;
          }
        }
      }
    });

  })
  .directive('submission', function ($rootScope, Polls) {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        submission: '='
      },
      templateUrl: 'components/poll/submission.html',
      link: function ($scope) {
        $scope.user = $rootScope.me;

        $scope.removeVote = function (submission) {
          Polls.Votes.delete(submission.vote).then(function () {
            submission.voted = false;
            submission.vote = null;
          });
        };

        $scope.addVote = function (submission) {
          Polls.Votes.create(submission).then(function (vote) {
            submission.voted = true;
            submission.vote = vote;
          });
        };

        $scope.deleteSubmission = function (submission) {
          Polls.Submissions.delete(submission);
        };

        Polls.promise.then(function () {
          $scope.submissions = Polls.submissions;
        });
      }
    };
  });
