angular.module('post_controllers', [])
  .controller('UserCtrl', function ($scope, $rootScope, $http, BACKEND_SERVER, User) {
    // Get data on startup
    var username = localStorage.getItem('username');
    $http.get(BACKEND_SERVER + 'users/' + username + '\/')
      .then(function (res) {
        console.log('user result', res);
        $scope.user = res.data
      });
    $scope.getProfilePic = function (user_id) {
      User.users.forEach(function (user) {
        if (user.id == user_id) {
          console.log('profile pic', user.profile_pic);
          return user.profile_pic
        }
      })
    }
  })
  .controller('UsersCtrl', function ($scope, $interval, $http, BACKEND_SERVER, User) {
    $scope.$watch(function () {
      $scope.users = User.users;
      $scope.connected_users = User.connected_users;
    })

  })
  .controller('PostListCtrl', function ($scope, $rootScope, $http, $sce, $location, $mdDialog, BACKEND_SERVER) {
    // Get data on startup
    var page = 1;
    var params = $location.search();
    // Don't keep searching.
    var end_of_pages = false;
    $scope.busy = true;
    $scope.posts = [];
    var add_pages = function (post_page) {
      $scope.busy = true;
      if (post_page == undefined) {
        post_page = 1;
      }
      var query_string = 'posts/?page=' + post_page;
      if (params.category) {
        query_string = query_string + '&category=' + params.category;
      }
      if (params.user) {
        query_string = query_string + '&user=' + params.user;
      }
      $http.get(BACKEND_SERVER + query_string)
        .error(function (data, status, headers, config) {
          if (status == 404) {
            end_of_pages = true;
          }
        })
        .then(function (res) {
          console.log('add pages', post_page, res)
          res.data.results.forEach(function (result) {
            result.youtube = youtube_url_to_id(result.url);
            if (result.youtube) {
              console.log('youtube', result.youtube);
            }
            result.nsfw_show = false;
            $scope.posts.push(result);
          });
          console.log('posts', $scope.posts);
          page = post_page;
          $scope.busy = false;
        });
    };

    $scope.scroll = function () {
      if (!end_of_pages) {
        console.log('scrolling, adding page', page + 1);
        add_pages(page + 1);
      } else {
        console.log('end of pages')
      }

    };

    $scope.toggleNSFW = function (post) {
      post.nsfw_show = !post.nsfw_show;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.delete_post = function (index) {
      console.log('delete');
      var post = $scope.posts[index];
      $http.delete(BACKEND_SERVER + 'posts/' + post.id + '\/').success(function () {
        // Delete post
        $scope.posts.splice(index, 1);
      })
    };

    $scope.newPostDialog = function (ev) {
      $mdDialog.show({
        templateUrl: 'partials/new_post.html',
        targetEvent: ev
      })
    };

    // TODO(pcsforeducation) move to singleton
    $rootScope.$on('post', function (event, message) {
      console.log('push post', message);
      $scope.posts.unshift(message);
      $rootScope.$apply();
      console.log('posts', $scope.posts)
    });

    // Add first round of pages
    add_pages(1);
  })

  .controller('PostDetailCtrl', function ($scope, $rootScope, $http, $sce, $stateParams, $location, BACKEND_SERVER) {
    $scope.postId = $stateParams.postId;
    $scope.formData = {};

    $scope.toggleNSFW = function () {
      $scope.post.nsfw_show = !$scope.post.nsfw_show;
    };

    $scope.new_comment_submit = function () {
      $scope.formData.post = $scope.postId;
      console.log("submitting", $scope.formData, this);

      $http({
        url: BACKEND_SERVER + 'posts\/' + $scope.postId + '/comments\/',
        method: "POST",
        data: $.param($scope.formData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }

      })
        .success(function (data, status, headers, config) {
          //get_comments().then(function (res) {
          //  $scope.post.comment_set = res.data.comment_set;
          //});
        })
        .error(function ($scope, data, status, headers, config) {
          console.log('error', data);
          $scope.status = status + ' ' + headers;
        });

      $scope.formData = "";
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.delete_comment = function (index) {
      var comment = $scope.post.comment_set[index];
      $http.delete(BACKEND_SERVER + 'comments/' + comment.id + '\/').success(function () {
        // Delete post
        $scope.post.comment_set.splice(index, 1);
      })
    };

    $rootScope.$on('comment', function (event, message) {
      if (message.post == $scope.post.id) {
        $scope.post.comment_set.push(message);
        $rootScope.$apply();
      }
    });

    function get_comments() {
      return $http.get(BACKEND_SERVER + 'posts/' + $scope.postId + '\/')
    }

    get_comments().then(function (res) {
      $scope.post = res.data;
      $scope.post.nsfw_show = false;
      $scope.post.youtube = youtube_url_to_id($scope.post.url);
    });
  })

  .directive('media', function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'partials/media.html'
    }
  })

  .directive('post', function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'partials/post.html'
    }
  })

  .directive('comment', function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'partials/comment.html'
    }
  })

  .directive('photo', function () {
    return {
      restrict: 'EA',
      scope: {
        url: '=url',
        nsfw: '='
      },
      replace: true,
      templateUrl: 'partials/image.html'
    }
  })

  .directive('youtube', ['$sce', function ($sce) {
    return {
      restrict: 'EA',
      scope: {code: '='},
      replace: true,
      templateUrl: 'partials/youtube.html',
      link: function (scope) {
        scope.$watch('code', function (newVal) {
          if (newVal) {
            scope.url = $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + newVal + '?autoplay=0&autohide=1&modestbranding=1&rel=0&showinfo=0&autohide=1&iv_load_policy=3');
          }
        });
      }
    };
  }])

  .directive('ngimg', function () {
    return {
      restrict: 'EA',
      scope: {url: '='},
      replace: true,
      templateUrl: 'partials/ngimg.html'
    }
  })

  .filter('DTSince', function () {
    return function (dt) {
      if (dt == undefined) {
        return;
      }
      var now = new Date();
      var time;
      var label;
      var difference = (now - Date.parse(dt)) / 1000;
      if (difference < 60) {
        time = Math.floor(difference);
        return "a few seconds ago";
      }
      else if (difference < 3600) {
        time = Math.floor(difference / 60);
        label = time > 1 ? 'minutes' : 'minute';
      }
      else if (difference < 86400) {
        time = Math.floor(difference / 3600);
        label = time > 1 ? 'hours' : 'hour';
      }
      else if (difference < 2592000) {
        time = Math.floor(difference / 86400);
        label = time > 1 ? 'days' : 'day';
      }
      else if (difference < 77760000) {
        time = Math.floor(difference / 2592000);
        label = time > 1 ? 'months' : 'month';
      }
      else if (difference < 933120000) {
        time = Math.floor(difference / 77760000);
        label = time > 1 ? 'years' : 'year';
      }
      else if (difference < 9331200000) {
        // :) A guy can dream, right?
        // Hope there's no leap seconds..
        time = Math.floor(difference / 933120000);
        label = time > 1 ? 'decades' : 'decade';
      }
      return time + " " + label + " ago"
    }
  })


  .controller('InviteCtrl', function ($scope, $http, $location, $state, BACKEND_SERVER) {
    var success_func = function (data, status, headers, config) {
      $state.go('posts');
      $scope.$apply();
    };
    var error_func = function (data, status, headers, config) {
      $scope.status = status + ' ' + headers;
    };
    $scope.invite_submit = function () {
      console.log('submitting invite request', $scope.formData);
      $http({
        url: BACKEND_SERVER + 'invites\/',
        method: "POST",
        data: $.param($scope.formData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
      }).success(success_func).error(error_func);
    }
  })

  .controller('TabCtrl', function ($scope, $location, $mdSidenav, $http, Config, BACKEND_SERVER, Notification) {
    Config.tabs.then(function (tabs) {
      $scope.tabs = tabs;
      $scope.alerts = Config.alert_count;
    });

    // Highlight current tab
    //var find_tab = function () {
    //  var current_location = "/#" + $location.path();
    //  $scope.tabs.forEach(function (tab) {
    //    // NOTE(pcsforeducation) This could give false positives
    //    tab.highlighted = (current_location.indexOf(tab.link) >= 0);
    //    return;
    //  });
    //};

    // Update highlighted tab when clicked
    $scope.select = function (item) {
      $scope.selected = item;
    };

    $scope.itemClass = function (item) {
      //if (item.name == 'Chat') {
      //
      //  return 'hide-tab'
      //}
      return item === $scope.selected ? 'active' : undefined;
    };

    // Update highlighted tab
    //$scope.$on('$locationChangeStart', function () {
    //  find_tab();
    //});

    $scope.toggleLeft = function () {
      $mdSidenav('left').toggle();
    };
    $scope.toggleRight = function () {
      $mdSidenav('right').toggle();
    };

    // Init
    //find_tab();
  })

  // Material design
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav) {
    $scope.close = function () {
      $mdSidenav('left').close();
    };
  })

  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav) {
    $scope.close = function () {
      $mdSidenav('right').close();
    };
  })
  .directive('focusMe', function ($timeout) {
    return {
      link: function (scope, element, attrs) {
        scope.$watch(attrs.focusMe, function (value) {
          if (value === true) {
            $timeout(function () {
              element[0].childNodes[3].focus();
              scope[attrs.focusMe] = false;
            });
          }
        });
      }
    };
  })

  .controller('NewPostCtrl', function ($scope, $rootScope, $http, $location, $mdDialog, BACKEND_SERVER) {
    $scope.search_url = BACKEND_SERVER + 'categories/?search=';
    $scope.show_form = false;
    $scope.focus_input = false;
    $scope.initial_title = "What's up?";

    // Get a list of categories for the dropdown
    $http.get(BACKEND_SERVER + 'categories/')
      .success(function (res, status, headers, config) {
        $scope.categories = res;
        console.log('categories', $scope.categories)
      });

    $http.get(BACKEND_SERVER + 'categories/top/')
      .success(function (res, status, headers, config) {
        console.log('categories', res);
        $scope.top_categories = res;
        console.log('top categories', $scope.top_categories)
      });

    $scope.post = {};

    $scope.new_post_submit = function () {
      console.log("submitting", $scope.post);

      $http({
        url: BACKEND_SERVER + 'posts\/',
        method: "POST",
        data: $.param($scope.post),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
      }).success(function (data, status, headers, config) {
        $scope.post = {};
        $mdDialog.hide();
        //$location.path('/#/posts').replace();
      }).error(function ($scope, data, status, headers, config) {
        console.log('new post submit error', data);
        $scope.status = status + ' ' + headers;
      });
    };

  })
  .directive('attronoff', function () {
    return {
      link: function ($scope, $element, $attrs) {
        $scope.$watch(
          function () {
            return $element.attr('data-attr-on');
          },
          function (newVal) {
            var attr = $element.attr('data-attr-name');

            if (!eval(newVal)) {
              $element.removeAttr(attr);
            }
            else {
              $element.attr(attr, attr);
            }
          }
        );
      }
    };
  });

function removeChatIfAlreadyExists(chat, array) {
  var result = array.filter(function (potentialMatch) {
    return potentialMatch.id != chat.id;
  });

  return result;
}

function youtube_url_to_id(url) {
  if (!url) {
    return;
  }
  var vid = url.split('v=')[1];
  if (!vid) {
    return;
  }
  var ampersandPosition = vid.indexOf('&');
  if (ampersandPosition != -1) {
    vid = vid.substring(0, ampersandPosition);
  }
  return vid
}

function DialogController($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.answer = function (answer) {
    $mdDialog.hide(answer);
  };
}

function NewPostCtrl($scope, $rootScope, $http, $location, $mdDialog, BACKEND_SERVER) {
  $scope.search_url = BACKEND_SERVER + 'categories/?search=';
  $scope.initial_title = "What's up?";
  // Get a list of categories for the dropdown
  $http.get(BACKEND_SERVER + 'categories/')
    .success(function (res, status, headers, config) {
      console.log('categories', res);
      $scope.categories = res;
      $scope.category_list = [];
      $scope.categories.forEach(function (category) {
        $scope.category_list.push(category.name);
      });
      console.log('category list', $scope.category_list)
    });

  $http.get(BACKEND_SERVER + 'categories/top/')
    .success(function (res, status, headers, config) {
      console.log('categories', res);
      $scope.top_categories = res;
      console.log('top categories', $scope.top_categories)
    });

  $scope.post = {};

  $scope.new_post_submit = function () {
    console.log("submitting", $scope.post);

    $scope.post.category = $scope.post.category.originalObject.id;
    console.log("submitting", $scope.post);

    $http({
      url: BACKEND_SERVER + 'posts\/',
      method: "POST",
      data: $.param($scope.post),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization': 'Token ' + localStorage.getItem('token')
      }
    }).success(function (data, status, headers, config) {
      $scope.post = {};
      $mdDialog.hide();
      $mdDialog.cancel();
      //$location.path('/#/posts').replace();
    }).error(function ($scope, data, status, headers, config) {
      console.log('error', data);
      $scope.status = status + ' ' + headers;
    });
  };

};