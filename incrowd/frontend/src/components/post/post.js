angular.module('incrowd')
  .directive('post', function ($rootScope, $sce, Posts) {
    "use strict";

    return {
      restrict: 'E',
      scope: {
        post: '='
      },
      templateUrl: 'components/post/post.html',
      link: function ($scope) {
        $scope.user = $rootScope.me;
        $scope.ngembedOptions = $rootScope.ngembedOptions;

        $scope.toggleNSFW = function (post) {
          post.nsfw_show = !post.nsfw_show;
        };

        $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.youtubeURL = function (url) {
          var base = 'https://youtube.com/embed/';
          var options = '?autoplay=0&autohide=1&modestbranding=1&rel=0&showinfo=0&autohide=1&iv_load_policy=3';
          var code = youtube_url_to_id(url);
          var youtube_url = base + code + options;
          return $sce.trustAsResourceUrl(youtube_url);
        };

        $scope.delete_post = function (id) {
          Posts.delete(id);
        };
      }
    };
  })

  .controller('PostListCtrl', function ($scope, $log, Posts) {
    "use strict";

    // Get data on startup
    var endOfPages = false;
    $scope.page = 1;
    $scope.busy = true;

    Posts.promise.then(function () {
      $scope.posts = Posts.posts;
      $scope.busy = false;
    });

    $scope.scroll = function () {
      if (!endOfPages && !$scope.busy) {
        $log.debug('scrolling, adding page', $scope.page + 1);
        $scope.busy = true;
        Posts.addPage($scope.page + 1).then(function () {
          $scope.busy = false;
          $scope.page++;
          $scope.posts = Posts.posts;
          console.log('Scrolled to page', $scope.page, $scope.posts);
        }, function () {
          // TODO(pcsforeducation) this might be a real error
          endOfPages = true;
          $scope.busy = false;
        });
        $scope.busy = false;
      } else {
        $log.debug('end of pages/busy', endOfPages, $scope.busy);
      }

    };
  })

  .controller('PostDetailCtrl', function ($scope,  $stateParams, Posts) {
    "use strict";

    $scope.postId = $stateParams.postId;

    // Bind to the post once fetched
    console.log(Posts.promise);
    Posts.promise.then(function () {
      $scope.post = Posts.get(parseInt($scope.postId));
      console.log("post", $scope.post);
      console.log("Posts", Posts.posts);
      //$scope.post.youtube = youtube_url_to_id($scope.post.url);
    });


    $scope.formData = new Posts.Comments.resource({post: $scope.postId});
    $scope.submitDhow = false;
  });

