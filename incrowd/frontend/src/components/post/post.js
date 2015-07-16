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

  .controller('PostListCtrl', function ($scope, $rootScope, $http, $sce, $location, $mdDialog, Posts, BACKEND_SERVER) {
    "use strict";

    // Get data on startup
    var page = 1, end_of_pages = false;
    $scope.busy = true;

    Posts.promise.then(function () {
      $scope.posts = Posts.posts;
    });

    $scope.scroll = function () {
      if (!end_of_pages) {
        console.log('scrolling, adding page', page + 1);
        add_pages(page + 1);
      } else {
        console.log('end of pages');
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

