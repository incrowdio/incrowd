angular.module('incrowdLib')
  .factory('favicoService', [
    function () {
      var favico = new Favico({
        animation: 'pop'
      });

      var badge = function (num) {
        favico.badge(num);
      };
      var reset = function () {
        favico.reset();
      };

      return {
        badge: badge,
        reset: reset
      };
    }]);
