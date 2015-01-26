angular.module('auth', [])
  .controller('AuthCtrl', function ($scope, $rootScope, $location, $window, httpInterceptor, authorization, api, AuthService, Auth, BACKEND_SERVER) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      Auth.setCredentials($rootScope, BACKEND_SERVER, credentials);
      console.log('credentials set', $rootScope.loggedIn);
      //$window.location.href = $window.location.href.replace('/#/login', '/#/posts');
      //$window.location.reload();
    };
    $scope.logout = function () {
      Auth.clearCredentials();
      $location.path('/login').replace();
    };
    $scope.loggedIn = $rootScope.loggedIn;
  })

  .factory('httpInterceptor', function httpInterceptor($q, $window, $location, $state) {
    return function (promise) {
//      console.log('http intercepted');
      var success = function (response) {
        return response;
      };

      var error = function (response) {
        if (response.status === 401) {
          $state.go('login');
        }

        return $q.reject(response);
      };

      return promise.then(success, error);
    };
  })

  .factory('authorization', function ($http) {
    var url = 'http://127.0.0.1:8080';

    return {
      login: function (credentials) {
        return $http.post(url + '/api/token\/', credentials);
      }
    };
  })

  .factory('api', function ($http, $cookies) {
    return {
      init: function (token) {
        $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
      }
    };
  })

  .factory('AuthService', function ($http, $cookies, Session) {
    return {
      login: function (credentials) {
        // Get the CSRF token :(
        return $http.get('http://127.0.0.1:8080/api/cookie\/').then(
          $http
            .post('http://127.0.0.1:8080/auth/login\/', credentials)
            .then(function (res) {
              Session.create(res.id, res.username, res.token);
            }));
      },
      isAuthenticated: function () {
        return !!Session.userId;
      }
    };
  })

  .factory('Auth', ['Base64', '$http', '$rootScope', '$location', '$window', '$state', 'BACKEND_SERVER', function (Base64, $http, $rootScope, $location, $window, $state, BACKEND_SERVER) {
    // initialize to whatever is in the cookie, if anything
    $http.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem('token');

    var success_function = function (data, status, headers, config) {

      var token = data['token'];
      localStorage.setItem('token', token);
      localStorage.setItem('username', data['username']);
      $http.defaults.headers.common.Authorization = 'Token ' + token;
      $rootScope.loggedIn = true;
      console.log('login successful, setting token, redirecting', $rootScope.loggedIn, $window.location.href);
      // TODO(pcsforeducation) move to controller
      //$state.transitionTo('posts', {}, { reload: true });
      $window.location.href = $window.location.href.replace('#/login', '#/posts');
      $window.location.reload();
    };

    var error_function = function (data, status, headers, config) {
      console.log('login error', status, headers);
    };

    return {
      setCredentials: function (scope, BACKEND_SERVER, credentials) {
        var encoded = Base64.encode(credentials['username'] + ':' + credentials['password']);
        $http({
          url: BACKEND_SERVER + 'token\/',
          method: "GET",
          headers: {
            'Authorization': 'Basic ' + encoded
          }
        }).success(success_function).error(error_function);
      },
      clearCredentials: function () {
        document.execCommand("ClearAuthenticationCache");
        localStorage.removeItem('token');
        $http.defaults.headers.common.Authorization = 'Basic ';
        $rootScope.loggedIn = false;
      }
    };
  }])

  .factory('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
      'QRSTUVWXYZabcdef' +
      'ghijklmnopqrstuv' +
      'wxyz0123456789+/' +
      '=';
    return {
      encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

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
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

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

          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
          }

          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
      }
    };
  })
  .service('Session', function () {
    this.create = function (sessionId, userId, token) {
      this.id = sessionId;
      this.username = username;
    };
    this.destroy = function () {
      this.id = null;
      this.username = null;
      token = null;
    };
    return this;
  });