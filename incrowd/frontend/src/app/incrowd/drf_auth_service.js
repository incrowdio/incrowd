angular.module('drf_auth.token', [])
  // Note: You should inject this to your app.run() to get Auth set up as early
  // as possible.
  .factory('Auth', function (Base64, $http, $log, $rootScope, $location, $window, $state, $q, BACKEND_SERVER) {
    // initialize to whatever is in the cookie, if anything
    "use strict";
    if (localStorage.getItem('token')) {
      $http.defaults.headers.common.Authorization = 'Token ' + localStorage.getItem('token');
      $rootScope.loggedIn = true;
    } else {
      $rootScope.loggedIn = false;
    }
    $log.debug('User logged in: ', $rootScope.loggedIn);
    return {
      setCredentials: function (credentials) {
        var deferred = $q.defer();
        var encoded = Base64.encode(credentials.username + ':' +
          credentials.password);
        $log.debug('Getting auth token.');
        $http.get(BACKEND_SERVER + 'token\/', {
          headers: {
            'Authorization': 'Basic ' + encoded
          }
        }).success(function (data) {
          // Successfully logged in, save token, return success to caller
          $log.debug('Successfully got auth token');
          var token = data.token;
          localStorage.setItem('token', token);
          localStorage.setItem('username', data.username);
          $http.defaults.headers.common.Authorization = 'Token ' + token;
          $rootScope.loggedIn = true;
          $log.debug('resolving..')
          deferred.resolve();
        }).error(function (data, status, headers) {
          // Login failed
          $log.warn('login error', data, status, headers);
          deferred.reject();
        });
        return deferred.promise;
      },
      clearCredentials: function () {
        document.execCommand("ClearAuthenticationCache");
        localStorage.removeItem('token');
        $http.defaults.headers.common.Authorization = 'Basic ';
        $rootScope.loggedIn = false;
      },
      checkStateChange: function (event, toState, noAuthStates) {
        $log.debug('Checking state change, going to ', toState.name);

        // now, redirect only not authenticated and on auth required states
        if ($rootScope.loggedIn !== true && noAuthStates.indexOf(toState.name) === -1) {
          event.preventDefault();
          // Clear auth so we don't get an infinite loop
          this.clearCredentials();

          // user is not authenticated. stow the state they wanted before you
          // send them to the signin state, so you can return them when you're done
          $rootScope.returnToState = $rootScope.toState;
          $rootScope.returnToStateParams = $rootScope.toStateParams;

          // now, send them to the signin state so they can log in
          $state.go('login'); // go to login

        }
      }
    };
  })

  .factory('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
      'QRSTUVWXYZabcdef' +
      'ghijklmnopqrstuv' +
      'wxyz0123456789+/' +
      '=';
    return {
      encode: function (input) {
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4 = "", i = 0;

        do {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
      },

      decode: function (input) {
        var output, chr1, chr2, chr3, enc1, enc2, enc3, enc4 = "", i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
          alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
          enc1 = keyStr.indexOf(input.charAt(i++));
          enc2 = keyStr.indexOf(input.charAt(i++));
          enc3 = keyStr.indexOf(input.charAt(i++));
          enc4 = keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
          }

          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
      }
    };
  });

