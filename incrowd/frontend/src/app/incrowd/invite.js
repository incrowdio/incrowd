angular.module('incrowdLib')
  .service('Invites', function ($q, $rootScope, $log, djResource, BACKEND_SERVER) {
    "use strict";

    var Invites = {};

    Invites.resource = djResource(BACKEND_SERVER + 'invite\/:inviteId\/', {
      inviteId: '@id'
    });

    Invites.create = function (formData) {
      var d = $q.defer();

      formData.$save().$promise.success(function (data) {
        $log.info('Created invite', data);
        d.resolve(data);
      }).error(function (data) {
        $log.error('Failed to create invite', data);
        d.reject(data);
      });

      return d.promise;
    };

    return Invites;
  });
