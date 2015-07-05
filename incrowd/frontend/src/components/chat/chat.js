angular.module('incrowd')
  .controller('ChatCtrl', function ($scope, $rootScope, $timeout, $http, $location, Chats, BACKEND_SERVER) {
    "use strict";
    $scope.formData = new Chats.resource();

    Chats.promise.then(function (messages) {
      $scope.chats = messages;
      $scope.scroll();
    });

    $scope.scroll = function () {
      $timeout(function () {
        var message_div = $('#sidebar_chat_container'),
          message_div2 = $('#content');
        console.log('scrolling on load', message_div);
        message_div.scrollTop(1000000000);
        // Hack! Scroll whole ng-view if on mobile chat :(
        if ($location.url() === '/chat') {
          message_div2.scrollTop(1000000000);
        }
      }, 10);
    };

    $scope.delete_message = function (chat) {
      Chats.remove(chat);
    };

    $scope.send_message = function () {
      if ($scope.submitDisabled) {
        return;
      }
      $scope.submitDisabled = true;
      Chats.send($scope.formData).then(function () {
        $scope.submitDisabled = false;
        $scope.formData = new Chats.resource();
      });
    };

    $scope.chatHighlight = function (message) {
      var username = localStorage.getItem('username'),
        regex = new RegExp('\@' + username + ' ', 'gi');
      if (username) {
        // Fight race where username isn't set yet
        // TODO(pcsforeducation) fix for usernames at end of message
        if (regex.exec(message.message) !== null) {
          return 'highlight';
        }
      }
    };

    $scope.chatBackground = function (message, previous_message) {
      var primary = 'chat_background_primary',
        alt = 'chat_background_alternate';
      if (previous_message === undefined) {
        // First message edge case
        return 'chat_background_primary';
      }
      else if (message.user != previous_message.user) {
        message.chat_class = previous_message.chat_class == alt ? alt : primary;
        return message.chat_class;
      }
      else {
        return previous_message.chat_class
      }
    };

    $rootScope.$on('$newChatMessage', function () {
      $scope.scroll();
    });
  })

  .filter('ChatMessageFilter', function () {
    return function (message) {
      // Highlights
      var username = localStorage.getItem('username'),
        regex = new RegExp('\@' + username + ' ', 'gi');
      // New lines
      message = message.replace('\n', '<br/>');
      if (username) {
        // Fight race where username isn't set yet
        // TODO(pcsforeducation) fix for usernames at end of message
        message = message.replace(regex, '<span class="highlight">@' + username
          + '</span>');
      }

      return message;
    };
  })

  .filter('HighlightFilter', function () {

  })

  .directive('compile', ['$compile', function ($compile) {
    return function (scope, element, attrs) {
      scope.$watch(
        function (scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function (value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  }])

  .directive('ngEnter', function () {
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
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'components/chat/chat.html'
    }
  })

  .directive('chatinput', function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'components/chat/chat_input.html'
    }
  })

  .directive('scrollToBottom', function ($timeout, $location) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {

            var message_div = $('#sidebar_chat_container');
            console.log('scrolling on load', message_div);
            message_div.scrollTop(1000000000);
            // Hack! Scroll whole ng-view if on mobile chat :(
            if ($location.url() == '/chat') {
              var message_div2 = $('#content');
              message_div2.scrollTop(1000000000);
            }
          }, 0);
        }
      }
    }
  })

  .directive('scrollChatOnLoad', function ($location) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('load', function () {

          var message_div = $('#sidebar_chat_container');
          console.log('scrolling on load', message_div);
          message_div.scrollTop(1000000000);
          // Hack! Scroll whole ng-view if on mobile chat :(
          if ($location.url() == '/chat') {
            var message_div2 = $('#content');
            message_div2.scrollTop(1000000000);
          }
        });
      }
    };
  });
