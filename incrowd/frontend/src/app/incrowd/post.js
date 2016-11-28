angular.module('incrowd')
  .service('Posts', function ($q, $log, $rootScope, djResource, BACKEND_SERVER) {
    "use strict";

    var Posts = {},
      deferred = $q.defer(),
      categoriesDeferred = $q.defer();

    Posts.promise = deferred.promise;

    Posts.Categories = {};
    Posts.Categories.promise = categoriesDeferred.promise;
    Posts.Categories.resource = djResource(BACKEND_SERVER + 'categories\/', {});

    Posts.Comments = {};
    Posts.Comments.resource = djResource(BACKEND_SERVER + 'comments\/:commentId\/', {
      commentId: '@id'
    });


    Posts.posts = [];
    Posts.resource = djResource(BACKEND_SERVER + 'posts\/:postId\/', {
      postId: '@id',
      page: '@page',
      category: '@category',
      user: '@user'
    });

    // TODO(pcsforeducation) generalize for all services
    function getPostIndex(id) {
      var i;
      for (i = 0; i < Posts.posts.length; i++) {
        //$log.debug('Comparing post', Posts.posts[i].id === id, Posts.posts[i].id, id, Posts.posts[i]);
        if (Posts.posts[i].id === id) {
          return i;
        }
      }
    }

    function getCommentIndex(id, post) {
      var i;
      for (i = 0; i < post.comment_set.length; i++) {
        if (post.comment_set[i].id === id) {
          return i;
        }
      }
    }

    function getPostIdMap() {
      var map = {};
      angular.forEach(Posts.posts, function (post) {
        map[post.id] = post;
      });
      return map;
    }

    Posts.resource.query().$promise.success(function (data) {
      Posts.posts = data.results;
      deferred.resolve(Posts.posts);
      //$rootScope.$apply();
    }).error(function () {
      deferred.reject();
    });

    Posts.Categories.resource.query().$promise.success(function (data) {
      $log.debug('categories', data);
      Posts.categories = data;
      categoriesDeferred.resolve(Posts.categories);
      //$rootScope.$apply();
    }).error(function (err) {
      $log.error('category fail', err);
      categoriesDeferred.reject();
    });

    Posts.get = function (id) {
      var getDeferred = $q.defer();

      var index = getPostIndex(id);
      if (index === undefined) {
        // Not in the cache, fetch post
        // TODO: should cache this lookup.. but need to figure out how to display posts in order still
        $log.debug('Post not in cache, fetching: ', id);
        Posts.resource.get({postId: id}).$promise.success(function (post) {
          getDeferred.resolve(post);
        })
      }
      else {
        getDeferred.resolve(Posts.posts[index]);
      }
      return getDeferred.promise;
    };

    Posts.delete = function (id) {
      var postIndex;
      $log.debug('Deleting post ', id);
      Posts.resource.remove({postId: id}).$promise.success(function () {
        postIndex = getPostIndex(id);
        if (postIndex !== undefined) {
          Posts.posts.splice(postIndex, 1);
        }
        else {
          $log.warn('Could not delete post, not found', id);
        }
      });
    };

    Posts.postSubmit = function (formData) {
      var d = $q.defer();

      $log.debug('Submitting post', formData);
      formData.$save().$promise.success(function (data) {
        $log.debug('Post successfully submitted', data);
        d.resolve(data);
      }).error(function (data) {
        $log.error('Submitting post failed', data);
        d.reject(data);
      });

      return d.promise;
    };

    Posts.commentSubmit = function (formData) {
      var d = $q.defer();

      $log.debug('Submitting comment', formData);
      formData.$save().$promise.success(function (data) {
        $log.debug('Comment successfully submitted', data);
        d.resolve(data);
      }).error(function (data) {
        $log.error('Submitting comment failed', data);
        d.reject(data);
      });

      return d.promise;
    };

    Posts.tickle = function (id) {
      Posts.resource.get({'postId': id}).$promise.success(function (post) {
        Posts.posts.unshift(post);
        $rootScope.$broadcast('$newPost');
      });
    };

    Posts.addPage = function (page) {
      var d = $q.defer();
      Posts.resource.query({page: page}).$promise.success(function (data) {
        var postIds = getPostIdMap();
        angular.forEach(data.results, function (post) {
          if (postIds[post.id] === undefined) {
            Posts.posts.push(post)
          } else {
            $log.debug('Filtered out duplicated post id', post.id);
          }
        });
        $log.debug('Added posts page', page);
        d.resolve(Posts.posts);
        //$rootScope.$apply();
      }).error(function () {
        $log.error('Could not add page', page);
        d.reject();
      });

      return d.promise;
    };

    Posts.commentsTickle = function (id) {
      var i, len, post;
      Posts.Comments.resource.get({'commentId': id}).$promise.success(function (comment) {
        // Search for the matching post
        for (i = 0, len = Posts.posts.length; i < len; i++) {
          post = Posts.posts[i];
          if (comment.post === post.id) {
            post.comment_set.push(comment);
            $rootScope.$broadcast('$newComment', comment);
            break;
          }
        }
        $log.warn('Comments ticket failed for id', id);

      });
    };

    Posts.Comments.delete = function (id, postId) {
      var postIndex, post, commentIndex;
      $log.debug('Deleting comment', id);
      Posts.Comments.resource.remove({commentId: id}).$promise.success(function () {
        postIndex = getPostIndex(postId);
        if (postIndex !== undefined) {
          post = Posts.posts[postIndex];
          commentIndex = getCommentIndex(id, post);
          if (commentIndex !== undefined) {
            post.comment_set.splice(commentIndex, 1);
          }
        }
        else {
          $log.warn('Could not delete comment, not found', id);
        }
      });
    };

    // TODO(pcsforeducation) move to pusher sends id, we tickle to match mobile
    $rootScope.$on('post', function (event, message) {
      $log.debug('new post', event, message);
      Posts.posts.unshift(message);
    });

    $rootScope.$on('comment', function (event, message) {
      $log.debug('new comment', event, message);
      var index = getPostIndex(message.post);
      var post = Posts.posts[index];
      post.comment_set.push(message);
      $log.debug('new comment in post', post);
      $rootScope.$apply();
    });

    return Posts;
  });
