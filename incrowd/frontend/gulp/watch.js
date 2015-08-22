'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', ['markups', 'inject'], function () {
  gulp.watch([
    paths.src + '/*.html',
    paths.src + '/partials/*.html',
    paths.src + '/templates/*.html',
    paths.src + '/assets/css/*.css',
    paths.src + '/{app,components}/**/*.scss',
    paths.src + '/{app,components}/**/*.css',
    paths.src + '/{app,components}/**/*.js',
    paths.src + '/{app,components}/**/*.html',
    paths.src + '/app/js/config.json',
    'bower.json'
  ], ['inject']);
  gulp.watch([
    paths.src + '/{app,components}/**/*.jade',
    paths.src + '/index.jade'
  ], ['markups']);
});
