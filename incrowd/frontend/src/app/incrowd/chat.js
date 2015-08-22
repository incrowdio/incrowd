angular.module('incrowdLib')
  .service('Chats', function ($q, $rootScope, $log, djResource, BACKEND_SERVER, INCROWD_EVENTS) {
    "use strict";

    var Chats = {}, deferred = $q.defer();

    Chats.messages = [];
    Chats.promise = deferred.promise;

    // Get the first page of results
    Chats.resource = djResource(BACKEND_SERVER + 'chat/messages\/:id\/', {}, {
      'get': {method: 'GET'},
      'save': {method: 'POST'},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'}
    });

    Chats.resource.query().$promise.success(function (data) {
      Chats.messages = data.results.reverse();
      deferred.resolve(Chats.messages);
      //$rootScope.$apply();
    }).error(function () {
      deferred.reject();
    });

    Chats.remove = function (msg) {
      Chats.resource.delete(msg.id).$promise.success(function () {
        var index = Chats.messages.indexOf(msg);
        Chats.messages.splice(index, 1);
      });
    };

    Chats.send = function (msg) {
      return msg.$save().$promise;
    };

    Chats.tickle = function (id) {
      // Tickles from push services, fetch the id
      var message = Chats.resource.get({'id': id});
      Chats.messages.push(message);
      $rootScope.$broadcast('$newChatMessage');
      $rootScope.$apply();
    };

    $rootScope.$on('chat', function (e, data) {
      // Push chat messages
      Chats.messages.push(data);
      $rootScope.$broadcast('$newChatMessage');
      $rootScope.$apply();
    });

    return Chats;
  });
