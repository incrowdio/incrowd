angular.module('incrowd')
  .directive('newPostForm', function () {
    "use strict";

    return {
      restrict: 'E',
      scope: {
        user: '='
      },
      templateUrl: 'components/new_post/new_post.html'
    };
  })

  .controller('NewPostCtrl', function ($scope, $rootScope, $location, $mdDialog, Posts, BACKEND_SERVER) {
    "use strict";
    $scope.formData = new Posts.resource();

    Posts.Categories.promise.then(function () {
      $scope.categories = Posts.categories;
    });

    $scope.new_post_submit = function () {
      console.log("submitting", $scope.formData);
      Posts.postSubmit($scope.formData).then(
        function () {
          $scope.formData = new Posts.resource();
          $mdDialog.hide();
          //$location.path('/#/posts').replace();
        }, function ($scope, data, status, headers) {
          console.log('new post submit error', data);
          $scope.status = status + ' ' + headers;
        });
    };

    $scope.newPostDialog = function (ev) {
      $mdDialog.show({
        templateUrl: 'components/new_post/new_post.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

  });
