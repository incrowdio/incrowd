angular.module('incrowdLib')
  .service('Polls', function ($http, $rootScope, $q, $log, $stateParams, $location, djResource, Users, BACKEND_SERVER) {
    "use strict";

    var Polls = {},
      deferred = $q.defer();

    Polls.Votes = {};
    Polls.Submissions = {};

    Polls.promise = deferred.promise;

    Polls.resource = djResource(BACKEND_SERVER + 'polls\/polls\/:pollStub\/', {
      pollStub: '@stub',
      submissionId: '@id'
    });

    Polls.Submissions.resource = djResource(BACKEND_SERVER + 'polls\/submissions\/:submissionId\/', {
      pollStub: '@stub',
      submissionId: '@id'
    });

    Polls.Votes.resource = djResource(BACKEND_SERVER + 'polls\/votes\/:voteId\/', {
      voteId: '@id'
    });

    // Init poll list
    Polls.resource.query().$promise.success(function (data) {
      Polls.polls = data;
      deferred.resolve(Polls.polls);
      //$rootScope.$apply();
    }).error(function () {
      deferred.reject();
    });

    function getIndexById(list, id) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          return i;
        }
      }
    }

    Polls.Submissions.create = function (formData, pollStub) {
      var d = $q.defer();
      $log.debug("submitting poll", formData);

      var i;
      for (i = 0; i < Polls.polls.length; i++) {
        if (Polls.polls[i].stub === pollStub) {
          formData.poll = Polls.polls[i].id;
        }
      }

      formData.$save().$promise.success(function (data) {
        $log.debug('Poll submission successfully submitted');
        d.resolve(data);
      }).error(function (data) {
        $log.error('Poll submission failed', data);
        d.reject(data);
      });

      return d.promise;
    };

    Polls.Submissions.get = function () {
      // TODO(pcsforeducation) cache, support > 1 poll
      var d = $q.defer();

      Polls.Submissions.resource.query().$promise.success(function (data) {
        Polls.Submissions.submissions = data;
        d.resolve(data);
      });

      return d.promise;
    };

    Polls.Votes.get = function () {
      // TODO(pcsforeducation) cache, support > 1 poll
      var d = $q.defer();

      Polls.Votes.resource.query().$promise.success(function (data) {
        Polls.Votes.votes = data;
        d.resolve(data);
      });

      return d.promise;
    };

    Polls.Votes.create = function (submission) {
      // Takes a submission object and creates a vote
      var d = $q.defer();
      var formData = new Polls.Votes.resource(
        {submission: submission.id, user: $rootScope.me.id});
      $log.debug("submitting vote for submission", submission);

      formData.$save().$promise.success(function (data) {
        $log.debug('Poll vote successfully submitted');
        d.resolve(data);
      }).error(function (data) {
        $log.error('Poll vote failed', data);
        d.reject(data);
      });

      return d.promise;
    };

    Polls.Votes.delete = function (vote) {
      var index;
      var d = $q.defer();

      $log.debug('Deleting post', vote);
      Polls.Votes.resource.remove({voteId: vote.id}).$promise.success(function () {
        index = getIndexById(Polls.Votes.votes, vote.id);
        Polls.Votes.votes.splice(index, 1);
        d.resolve();
      });

      return d.promise;
    };

    Polls.Submissions.delete = function (submission) {
      var index;
      var d = $q.defer();

      $log.debug('Deleting submission', submission);
      Polls.Submissions.resource.remove({submissionId: submission.id}).$promise.success(function () {
        index = getIndexById(Polls.Submissions.submissions, submission.id);
        Polls.Submissions.submissions.splice(index, 1);
        d.resolve();
      });

      return d.promise;
    };

    return Polls;
  });
