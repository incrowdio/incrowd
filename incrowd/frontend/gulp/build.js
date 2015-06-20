'use strict';

var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var print = require('gulp-print');
var rename = require('gulp-rename');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', ['markups'], function () {
  return gulp.src([
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/{app,components}/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('/partials/templateCacheHtml.js', {
      module: 'incrowd'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'))
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('minifyapp', [], function() {
  gulp.src(paths.src + '/app/**/*.js')
    .pipe(print());
});

gulp.task('minifycss', [], function() {
  gulp.src(paths.src + '/assets/**/*.css')
    .pipe(print())
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(paths.tmp + '/partials/templateCacheHtml.js', { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp + '/partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('/app/**/*.js');
  var cssFilter = $.filter('/assets/**/*.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe(print())
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)

    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(print())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('config', function() {
  gulp.src(paths.src + '/prod_settings.js')
    .pipe(print())
    .pipe(rename('settings.js'))
    .pipe(print())
    .pipe(gulp.dest(paths.dist))
    .pipe(print());
});

//gulp.task('config', function () {
//  gulp.src('gulp/prod_settings.json')
//    .pipe(rename('settings.json'))
//    .pipe(ngConstant({
//      name: 'triviastats.config'
//    }))
//    .pipe(print())
//
//    .pipe(gulp.dest(paths.dist));
//});
//
//gulp.task('config_dev', function () {
//  gulp.src('gulp/dev_settings.json')
//    .pipe(rename('settings.json'))
//    .pipe(ngConstant({
//      name: 'triviastats.config',
//      wrap: 'commonjs'
//    }))
//    .pipe(print())
//
//    .pipe(gulp.dest(paths.src));
//});

gulp.task('misc', function () {
  return gulp.src(paths.src + '/**/*.ico')
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc', 'config']);
