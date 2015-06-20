var jshint = require('gulp-jshint');
var gulp   = require('gulp');
var paths = gulp.paths;
var config = {
  "predef": [ "window" ]
};

gulp.task('lint', function() {
  return gulp.src([
    paths.src + '/{app,components}/**/*.js',
    '!' + paths.src + '/app/drr.js'])
    .pipe(jshint(config))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
