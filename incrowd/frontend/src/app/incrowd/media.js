angular.module('incrowdLib')
  .directive('media', function () {
    "use strict";
    return {
      restrict: 'E',
      transclude: true,
      replace: false,
      templateUrl: 'partials/media.html'
    };
  })

  .directive('photo', function () {
    "use strict";
    return {
      restrict: 'EA',
      scope: {
        url: '=url',
        nsfw: '='
      },
      replace: true,
      templateUrl: 'partials/image.html'
    };
  })

  .directive('gifv', function () {
    "use strict";
    return {
      restrict: 'EA',
      scope: {
        url: '=url',
        nsfw: '='
      },
      replace: true,
      templateUrl: 'partials/gifv.html'
    };
  })

  .directive('youtube', ['$sce', function ($sce) {
    "use strict";
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
    "use strict";
    return {
      restrict: 'EA',
      scope: {url: '='},
      replace: true,
      templateUrl: 'partials/ngimg.html'
    };
  });
