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

    $scope.newPostDialog = function () {
      $mdDialog.show({
        templateUrl: 'components/new_post/new_post.html'
      });
    };

  });


//function NewPostCtrl($scope, $rootScope, $http, $location, $mdDialog, BACKEND_SERVER) {
//  $scope.search_url = BACKEND_SERVER + 'categories/?search=';
//  $scope.initial_title = "What's up?";
//  // Get a list of categories for the dropdown
//  $http.get(BACKEND_SERVER + 'categories/')
//    .success(function (res, status, headers, config) {
//      console.log('categories', res);
//      $scope.categories = res;
//      $scope.category_list = [];
//      $scope.categories.forEach(function (category) {
//        $scope.category_list.push(category.name);
//      });
//      console.log('category list', $scope.category_list)
//    });
//
//  $http.get(BACKEND_SERVER + 'categories/top/')
//    .success(function (res, status, headers, config) {
//      console.log('categories', res);
//      $scope.top_categories = res;
//      console.log('top categories', $scope.top_categories)
//    });
//
//  $scope.post = {};
//
//  $scope.new_post_submit = function () {
//    console.log("submitting", $scope.post);
//
//    $scope.post.category = $scope.post.category.originalObject.id;
//    console.log("submitting", $scope.post);
//
//    $http({
//      url: BACKEND_SERVER + 'posts\/',
//      method: "POST",
//      data: $.param($scope.post),
//      headers: {
//        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//        'Authorization': 'Token ' + localStorage.getItem('token')
//      }
//    }).success(function (data, status, headers, config) {
//      $scope.post = {};
//      $mdDialog.hide();
//      $mdDialog.cancel();
//      //$location.path('/#/posts').replace();
//    }).error(function ($scope, data, status, headers, config) {
//      console.log('error', data);
//      $scope.status = status + ' ' + headers;
//    });
//  };
//
//}
