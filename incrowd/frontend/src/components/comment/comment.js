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
  .directive('commentList', function ($rootScope, $log, Posts) {
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
          $scope.submitDisabled = true;
          $scope.formData.post = $scope.postId;
          $log.debug('Submitting comment', $scope.formData);
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
