angular.module('chat', [])
  .controller('ChatCtrl', function ($scope, $rootScope, $timeout, $http, $location, Chat, BACKEND_SERVER) {
    Chat.messages_ready.then(function (messages) {
      $scope.messages = Chat.messages;
      $timeout(function () {
        var message_div = $('#sidebar_chat_container');
        console.log('scrolling on load', message_div);
        message_div.scrollTop(1000000000);
        // Hack! Scroll whole ng-view if on mobile chat :(
        if ($location.url() == '/chat') {
          var message_div2 = $('#content');
          message_div2.scrollTop(1000000000);
        }
      }, 100);
    });

    // Handler to sending messages
    $scope.send_message = function () {
//      console.log($scope.text, $scope.session);
      $http({
        method: 'POST',
        url: BACKEND_SERVER + 'chat/messages\/',
        data: {'message': $scope.text}
      });
      $scope.text = "";
    };
    $scope.chatHighlight = function (message) {
      var username = localStorage.getItem('username');
      if (username) {
        // Fight race where username isn't set yet
        var regex = new RegExp('\@' + username, 'gi');
        if (regex.exec(message.message) != null) {
          return 'highlight'
        }
      }
    };

    $rootScope.$on('chat', function () {
      $timeout(function () {
        var message_div = $('#sidebar_chat_container');
        console.log('scrolling on load', message_div);
        message_div.scrollTop(1000000000);
        // Hack! Scroll whole ng-view if on mobile chat :(
        if ($location.url() == '/chat') {
          var message_div2 = $('#content');
          message_div2.scrollTop(1000000000);
        }
      }, 1);
    });

  })

  .service('Chat', function ($http, $q, $rootScope, $interval, $mdSidenav, Channel, User, BACKEND_SERVER) {
    var Chats = {};
    Chats.messages = [];

    var chats_deferred = $q.defer();

    // Get the first page of results
    $http.get(BACKEND_SERVER + 'chat/messages\/').success(function (results) {
      Chats.messages = results.results.reverse();
      console.log('chat messages', Chats.messages);
      chats_deferred.resolve();
    });

    $rootScope.$on('chat', function (event, message) {
      Chats.messages.push(message);
      $rootScope.$apply();
    });

    Chats.messages_ready = chats_deferred.promise;

    return Chats;
  })

  .filter('ChatMessageFilter', function () {
    return function (message) {
      // New lines
      message = message.replace('\n', '<br/>');
      // Highlights
      username = localStorage.getItem('username');
      if (username) {
        // Fight race where username isn't set yet
        var regex = new RegExp('\@' + username, 'gi');
        message = message.replace(regex, '<span class="highlight">@' + username
        + '</span>')
      }

      return message
    }
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
      templateUrl: 'partials/chat.html'
    }
  })

  .directive('chatinput', function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'partials/chat_input.html'
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
