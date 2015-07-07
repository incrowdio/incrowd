angular.module('incrowd')
  .controller('ChatCtrl', function ($scope, $rootScope, $log, $timeout, $location, Chats) {
    "use strict";
    $scope.user = $rootScope.me;
    $scope.formData = new Chats.resource();

    Chats.promise.then(function () {
      $scope.chats = Chats.messages;
      $scope.scroll();
    });

    $scope.scroll = function () {
      $timeout(function () {
        var message_div = $('#sidebar_chat_container'),
          message_div2 = $('#content');
        $log.debug('scrolling on load', message_div);
        message_div.scrollTop(1000000000);
        // Hack! Scroll whole ng-view if on mobile chat :(
        if ($location.url() === '/chat') {
          message_div2.scrollTop(1000000000);
        }
      }, 10);
    };

    $scope.delete_message = function (id) {
      Chats.remove(id);
    };


    //$scope.chatBackground = function (message, previous_message) {
    //  var primary = 'chat_background_primary',
    //    alt = 'chat_background_alternate';
    //  if (previous_message === undefined) {
    //    // First message edge case
    //    return 'chat_background_primary';
    //  }
    //  else if (message.user != previous_message.user) {
    //    message.chat_class = previous_message.chat_class == alt ? alt : primary;
    //    return message.chat_class;
    //  }
    //  else {
    //    return previous_message.chat_class
    //  }
    //};

    $rootScope.$on('$newChatMessage', function () {
      $scope.scroll();
    });
  })

  .filter('ChatMessageFilter', function () {
    "use strict";
    return function (message) {
      // Highlights
      var username = localStorage.getItem('username'),
        regex = new RegExp('@' + username + ' ', 'gi');
      // New lines
      message = message.replace('\n', '<br/>');
      if (username) {
        // TODO(pcsforeducation) fix for usernames at end of message
        message = message.replace(regex, '<span class="highlight">@' + username
          + '</span>');
      }

      return message;
    };
  })

  .directive('ngEnter', function () {
    "use strict";
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter, {'event': event});
          });

          event.preventDefault();
        }
      });
    };
  })

  .directive('chat', function () {
    "use strict";
    return {
      restrict: 'E',
      templateUrl: 'components/chat/chat.html'
    };
  })

  .directive('chatInput', function (Chats) {
    "use strict";
    return {
      restrict: 'E',
      templateUrl: 'components/chat/chat_input.html',
      link: function ($scope) {
        $scope.submitDisabled = false;
        $scope.formData = new Chats.resource();
        $scope.send_message = function () {
          if ($scope.submitDisabled === false) {
            $scope.submitDisabled = true;
            Chats.send($scope.formData).then(function () {
              $scope.submitDisabled = false;
              $scope.formData = new Chats.resource();
            });
          }
        };
      }
    };
  })

  .directive('scrollToBottom', function ($timeout, $location, $log) {
    "use strict";
    return {
      restrict: 'A',
      link: function (scope) {
        if (scope.$last === true) {
          $timeout(function () {

            var message_div = $('#sidebar_chat_container');
            $log.debug('scrolling on load', message_div);
            message_div.scrollTop(1000000000);
            // Hack! Scroll whole ng-view if on mobile chat :(
            if ($location.url() === '/chat') {
              var message_div2 = $('#content');
              message_div2.scrollTop(1000000000);
            }
          }, 0);
        }
      }
    };
  })

  .directive('scrollChatOnLoad', function ($location, $log) {
    "use strict";
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('load', function () {

          var message_div = $('#sidebar_chat_container');
          $log.debug('scrolling on load', message_div);
          message_div.scrollTop(1000000000);
          // Hack! Scroll whole ng-view if on mobile chat :(
          if ($location.url() === '/chat') {
            var message_div2 = $('#content');
            message_div2.scrollTop(1000000000);
          }
        });
      }
    };
  });
