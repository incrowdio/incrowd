angular.module('incrowd')
  .directive('comment', function ($rootScope, Posts) {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        comment: '='
      },
      templateUrl: 'components/comment/comment.html',
      link: function ($scope) {
        $scope.user = $rootScope.me;
        $scope.delete_comment = function (id, postId) {
          Posts.Comments.delete(id, postId);
        };
      }
    };
  })
  .directive('commentList', function ($rootScope, Posts) {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        comments: '=',
        postId: '=post'
      },
      templateUrl: 'components/comment/comment_list.html',
      link: function ($scope) {
        $scope.user = $rootScope.me;
        $scope.formData = new Posts.Comments.resource({});
        $scope.new_comment_submit = function () {
          console.log($scope.formData);
          $scope.submitDisabled = true;
          $scope.formData.post = $scope.postId;
          Posts.commentSubmit($scope.formData).then(function () {
            $scope.formData = new Posts.Comments.resource(
              {post: $scope.postId});
            $scope.submitDisabled = false;
          }, function () {
            $scope.submitDisabled = false;
          });
        };
      }
    };
  });
