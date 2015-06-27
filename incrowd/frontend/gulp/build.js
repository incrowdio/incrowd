'use strict';

var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var gulpif = require('gulp-if');
var print = require('gulp-print');
var rename = require('gulp-rename');
var wiredep = require('wiredep').stream;

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('inject', ['partials', 'styles'], function () {
  var injectStyles = gulp.src([
    paths.tmp + '/serve/{app,components}/**/*.css',
    paths.src + '/assets/css/*.css',
    '!' + paths.tmp + '/serve/app/vendor.css'
  ], {read: false});

  var injectScripts = gulp.src([
    paths.src + '/{app,components}/**/*.js',
    '!' + paths.src + '/settings.js',
    '!' + paths.src + '/{app,components}/**/*.spec.js',
    '!' + paths.src + '/{app,components}/**/*.mock.js'
  ]).pipe($.angularFilesort());

  var injectOptions = {
    ignorePath: [paths.src],
    addRootSlash: false
  };

  var wiredepOptions = {
    directory: 'src/lib',
    exclude: [/bootstrap\.css/, /foundation\.css/]
  };

  return gulp.src(paths.src + '/*.html')
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    // Use relative here so it gets picked up a findable file in assets() in
    // 'html'.
    .pipe($.inject(gulp.src(paths.tmp + '/serve/templateCacheHtml.js',
      {read: false}), {name: 'cache', addRootSlash: false, relative: true}))
    .pipe(print())
    .pipe(wiredep(wiredepOptions))
    .pipe(gulp.dest(paths.tmp + '/serve'));

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
    .pipe($.angularTemplatecache('/serve/templateCacheHtml.js', {
      module: 'incrowd'
    }))
    .pipe(gulp.dest(paths.tmp + '/'));
});

gulp.task('html', ['inject'], function () {

  var assets;
  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe(assets = $.useref.assets())
    .pipe(assets.restore())
    .pipe(print(function (filepath) {
      return "assets: " + filepath;
    }))
    .pipe($.rev())
    //.pipe(gulpif('*.js', $.ngAnnotate()))
    //.pipe(gulpif('*.js', $.uglify({preserveComments: $.uglifySaveLicense})))
    //.pipe(gulpif('*.css', $.csso()))
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulpif('*.html', $.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    })))
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({title: paths.dist + '/', showFiles: true}));
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

gulp.task('config', function () {
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

gulp.task('build', ['clean', 'html', 'images', 'fonts', 'misc', 'config']);
