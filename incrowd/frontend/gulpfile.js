'use strict';

var gulp = require('gulp');

gulp.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  lib: 'src/lib'
};

gulp.paths.css = [
  gulp.paths.src + '/assets/css/incrowd-custom-theme.css',
  gulp.paths.src + '/assets/css/*.css',
  gulp.paths.src + '/components/**/*.css',
  '!' + gulp.paths.tmp + '/serve/app/vendor.css'
];

gulp.paths.js = [
  gulp.paths.src + '/{app,components}/**/*.js',
  '!' + gulp.paths.src + '/angular.js',
  '!' + gulp.paths.src + '/settings.js',
  '!' + gulp.paths.src + '/app/js/config.js',
  '!' + gulp.paths.src + '/{app,components}/**/*.spec.js',
  '!' + gulp.paths.src + '/{app,components}/**/*.mock.js'
];

require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
