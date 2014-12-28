"use strict";

angular.module('config', [])

.constant('ENV', 'development')

.constant('BACKEND_SERVER', '/api/v1/')

.constant('PUSHER_CHANNEL', 'private-incrowd-dev')

.constant('PUSHER_APP_KEY', 'ae4f4ab0b1792c193f3f')

.constant('PUSHER_PRESENCE', 'presence-incrowd-dev')
;
