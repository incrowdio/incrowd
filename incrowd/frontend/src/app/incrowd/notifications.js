angular.module('incrowdLib')
  .service('Notifications', function ($q, $log, $rootScope, $location, $state, $stateParams, djResource, BACKEND_SERVER, favicoService, Users) {
    "use strict";
    var Notifications = {}, deferred = $q.defer();

    Notifications.notifications = [];
    Notifications.promise = deferred.promise;

    Notifications.resource = djResource(BACKEND_SERVER + 'notifications\/:id\/', {}, {
      'get': {method: 'GET'},
      'save': {method: 'POST'},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'}
    });

    Notifications.resource.query().$promise.success(function (data) {
      Notifications.notifications = data.results;
      Notifications.update_favicon();
      deferred.resolve(Notifications.notifications);
      //$rootScope.$apply();
    }).error(function () {
      Notifications.update_favicon();
      deferred.reject();
    });

    Notifications.remove = function (item) {
      Notifications.resource.delete({id: item.id}).$promise.success(function () {
        var index = Notifications.notifications.indexOf(item);
        Notifications.notifications.splice(index, 1);
        Notifications.update_favicon();
      });
    };

    Notifications.remove_all = function () {
      // TODO(pcsforeducation) delete to /notifications should delete all
      var i, item;
      for (i = 0; i < Notifications.notifications.length; i++) {
        item = Notifications.notifications[i];
        Notifications.resource.delete(item.id);
      }
      Notifications.notifications = [];
      Notifications.update_favicon();
    };

    Notifications.update_favicon = function () {
      if (Notifications.notifications.length === 0) {
        favicoService.reset();
      }
      else {
        favicoService.badge(Notifications.notifications.length);
      }
    };

    // Listen for location changes, remove notifications if user sees page that
    // they were notified about changes on
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      Notifications.clear_for_url(toState, toParams);
    });


    Notifications.clear_for_url = function (toState, toParams) {
      Notifications.notifications.forEach(function (n) {
        $log.debug('checking for clear on ', n.type === 'comment' && $state.current.name === 'post' && $stateParams.postId === n.identifier);
        if (n.type === 'comment' && toState.name === 'post_details' && toParams.postId === n.identifier) {
          $log.debug('Deleting notification because you\'re on the page ', n);
          Notifications.remove(n);
        }
      });
    };

    Notifications.clear_chats = function () {
      Notifications.notifications.forEach(function (n) {
        $log.debug('clearing chat notifications');
        if (n.type === 'chat') {
          $log.debug('Deleting seen chat notification.');
          Notifications.remove(n);
        }
      });
    };

    // Listen to Channel updates for notifications
    $rootScope.$on('notify', function (event, message) {
      $log.debug('new notification', message);
      if (message.user === $rootScope.me.id) {
        Notifications.notifications.push(message);
        Notifications.update_favicon();
        $rootScope.$apply();
      }
    });

    Notifications.update_favicon();

    return Notifications;
  });
