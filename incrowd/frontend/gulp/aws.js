"use strict";
var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var cloudfront = require('gulp-invalidate-cloudfront');
var paths = gulp.paths;


var invalidationBatch = {
//    CallerReference: new Date().now().toString(),
  Paths: {
    Quantity: 1,
    Items: ['/index.html/']
  }
};

var prod = {
    params: {
      "Bucket": 'incrowd.io',
      "region": "us-east-1"
    },
    "region": "us-east-1"
};

var preprod = {
  params: {
    "Bucket": 'testing.incrowd.io',
    "region": "us-east-1"
  },
  "region": "us-east-1"
};


gulp.task('prod', function () {
  // create a new publisher
  var publisher = awspublish.create(prod);

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src(paths.dist + '/**/*')

    // gzip, Set Content-Encoding headers and add .gz extension
     .pipe(awspublish.gzip())

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    // print upload updates to console
    .pipe(awspublish.reporter());

    // invalidate root files in cloudfront to update
    //.pipe(cloudfront(invalidationBatch, aws));
});

gulp.task('preprod', function () {
  // create a new publisher
  var publisher = awspublish.create(preprod);

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src(paths.dist + '/**/*')

    // gzip, Set Content-Encoding headers and add .gz extension
    .pipe(awspublish.gzip())

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    // print upload updates to console
    .pipe(awspublish.reporter());

  // invalidate root files in cloudfront to update
  //.pipe(cloudfront(invalidationBatch, aws));
  //.pipe(cloudfront(aws));
});
