angular.module('incrowdLib')
  .filter('DTSince', function () {
    "use strict";
    return function (dt) {
      if (dt === undefined) {
        return;
      }
      var now = new Date();
      var time;
      var label;
      var difference = (now - Date.parse(dt)) / 1000;
      if (difference < 60) {
        time = Math.floor(difference);
        return 'just now';
      }
      if (difference < 3600) {
        time = Math.floor(difference / 60);
        label = 'm';
      }
      else if (difference < 86400) {
        time = Math.floor(difference / 3600);
        label = 'h';
      }
      else if (difference < 2592000) {
        time = Math.floor(difference / 86400);
        label = 'd';
      }
      else if (difference < 77760000) {
        time = Math.floor(difference / 2592000);
        label = 'mo';
      }
      else if (difference < 933120000) {
        time = Math.floor(difference / 77760000);
        label = 'yr';
      }
      else if (difference < 9331200000) {
        // :) A guy can dream, right?
        // Hope there's no leap seconds..
        time = Math.floor(difference / 933120000);
        label = time > 1 ? 'decades' : 'decade';
      }
      return time + ' ' + label;
    };
  })
  .directive('attronoff', function () {
    "use strict";
    return {
      link: function ($scope, $element) {
        $scope.$watch(
          function () {
            return $element.attr('data-attr-on');
          },
          function (newVal) {
            var attr = $element.attr('data-attr-name');

            if (!eval(newVal)) {
              $element.removeAttr(attr);
            }
            else {
              $element.attr(attr, attr);
            }
          }
        );
      }
    };
  })
  .directive('focusMe', function ($timeout) {
    return {
      link: function (scope, element, attrs) {
        scope.$watch(attrs.focusMe, function (value) {
          if (value === true) {
            $timeout(function () {
              element[0].childNodes[3].focus();
              scope[attrs.focusMe] = false;
            });
          }
        });
      }
    };
  });


function urlify(text) {
  "use strict";
  var expression = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

  var regex = new RegExp(expression);
  return text.replace(regex, function (url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
}

function highlight(text, highlight_text) {
  "use strict";
  text = text.insert(text.indexOf(highlight_text) - 1, '<span class="highlight">');
  return text.insert(text.indexOf(highlight_text) + highlight_text.length, '</span>');

}

// Add insert so we can add highlights easily.
String.prototype.insert = function (index, string) {
  "use strict";
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }
  return string + this;
};

function youtube_url_to_id(url) {
  "use strict";
  if (!url) {
    return;
  }
  var vid = url.split('v=')[1];
  if (!vid) {
    return;
  }
  var ampersandPosition = vid.indexOf('&');
  if (ampersandPosition !== -1) {
    vid = vid.substring(0, ampersandPosition);
  }
  return vid;
}

function removeChatIfAlreadyExists(chat, array) {
  "use strict";
  array.filter(function (potentialMatch) {
    return potentialMatch.id !== chat.id;
  });
}

function getIndexById(list, id) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
}
