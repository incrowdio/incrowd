angular.module('djangle', [])
  .factory('Form', ['$resource', function ($resource) {
    "use strict";
    return $resource('/_forms/', null,
      {
        'list': {method: 'GET'}
      });
  }])

  .directive('charfield', function () {
    "use strict";
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'static/partials/char_field.html'
    };
  })

  .directive('datefield', function () {
    "use strict";
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'static/partials/date_field.html'
    };
  })

  .directive('choicefield', function () {
    "use strict";
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'static/partials/choice_field.html'
    };
  })

  .directive('urlfield', function () {
    // TODO(pcsforeducation) refactor into charfield
    "use strict";
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'static/partials/url_field.html'
    };
  })

  .directive('djangoform', function () {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        form: '='
      },
      templateUrl: 'static/partials/django_form.html'
    };
  });
