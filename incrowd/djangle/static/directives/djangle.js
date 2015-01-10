angular.module('djangle', [])
  .factory('Form', ['$resource', function ($resource) {
    return $resource('/api/_forms/', null,
      {
        'list': { method: 'GET' }
      });
  }])

  .directive('charfield', function () {
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'partials/char_field.html'
    }
  })

  .directive('datefield', function () {
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'partials/date_field.html'
    }
  })

  .directive('choicefield', function () {
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'partials/choice_field.html'
    }
  })

  .directive('urlfield', function () {
    // TODO(pcsforeducation) refactor into charfield
    return {
      restrict: 'E',
      // declare the directive scope as private
      scope: {
        form: '='
      },
      templateUrl: 'partials/url_field.html'
    }
  })

  .directive('djangoform', function () {
    return {
      restrict: 'E',
      scope: {
        form: '='
      },
      templateUrl: 'partials/django_form.html'
    }
  });