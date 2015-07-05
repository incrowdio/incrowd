angular.module('incrowd')
  .controller('PollDetailCtrl', function ($scope, $http, $stateParams, $location, User, BACKEND_SERVER) {
    $scope.pollStub = $stateParams.pollStub;
    $scope.new_submission_submit = function () {
      $scope.submission['poll'] = $scope.poll.id;
      console.log("submitting poll", $scope.submission, this, $scope.poll);
      $http({
        url: BACKEND_SERVER + 'submissions\/',
        method: "POST",
        data: $.param($scope.submission),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
      }).success(function (data, status, headers, config) {
        console.log('new poll submission');

        $scope.submission = {};
        get_submissions();
      }).error(function ($scope, data, status, headers, config) {
        console.log('error', data);
        $scope.status = status + ' ' + headers;
      });
    };
    $scope.removeVote = function (id) {
      // Find the matching user vote
      var vote;
      $scope.user.user_votes.forEach(function (user_vote) {
        if (user_vote.submission == id) {
          vote = user_vote;
        }
      });
      if (vote == undefined) {
        console.log('Could not find matching vote for ', id);
        return
      }
      $http({
        url: BACKEND_SERVER + 'votes/' + vote.id + '\/',
        method: "DELETE",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
      }).success(function (data, status, headers, config) {
        $scope.poll.poll_submissions.forEach(function (submission) {
          if (submission.id == vote.submission) {
            submission.voted = false;
          }
        });
      }).error(function ($scope, data, status, headers, config) {
        console.log('error', data);
      })
    };

    $scope.addVote = function (id) {
      var data = {'submission': id, 'user': $scope.user.id};
      $http({
        url: BACKEND_SERVER + 'votes\/',
        method: "POST",
        data: $.param(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
      }).success(function (data, status, headers, config) {
        console.log('new vote', data);
        $scope.user.user_votes.push(data);
        // Update the submission
        $scope.poll.poll_submissions.forEach(function (submission) {
          if (submission.id == data.submission) {
            submission.voted = true;
          }
        });
      }).error(function ($scope, data, status, headers, config) {
        console.log('error', data);
      })
    };

    $scope.delete_submission = function (index) {
      console.log('delete');
      var submission = $scope.poll.poll_submissions[index];
      $http.delete(BACKEND_SERVER + 'submissions/' + submission.id + '\/').success(function () {
        // Delete post
        $scope.poll.poll_submissions.splice(index, 1);
      })
    };

    function get_submissions() {
      $http.get(BACKEND_SERVER + 'polls/' + $scope.pollStub + '\/')
        .then(function (res) {
          $scope.poll = res.data;
          // find user
          var user;
          User.users.forEach(function (site_user) {
            if (localStorage.getItem('username') == site_user.username) {
              user = site_user;
            }
          });
          console.log('user is', user);

          $scope.poll.poll_submissions.forEach(function (submission) {
            console.log('sub votes', submission, user.user_votes);
            var voted = false;
            user.user_votes.forEach(function (vote) {
              if (vote.submission == submission.id) {
                voted = true;
              }
            });
            submission.voted = voted;
          })
        });
    }

    get_submissions();
  });
