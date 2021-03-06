var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var server = require('gulp-express');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');


// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('gulp-clean', function() {
    return gulp.src('./build').pipe(clean());
});

var bundler = watchify(browserify('./public/js/report.js', watchify.args));
// add any other browserify options or transforms here
bundler.transform('brfs');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler

function bundle() {
    return bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('report.js'))

        // optional, remove if you dont want sourcemaps
        .pipe(buffer())
        //
        .pipe(gulp.dest('./build/js/'))
        .pipe(livereload());
}

gulp.task('sass', function () {
    gulp.src('./public/css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./build/css'))
        .pipe(livereload());
});


gulp.task('server', function () {
    // Start the server at the beginning of the task
    //gulp.watch(['app.js', 'routes/*.js', '*.js'], ['express-run']);
    livereload.listen();
    gulp.watch('./public/css/*.scss', ['sass']);
});

// workaround for trouble discussed here:
// https://github.com/gimm/gulp-express/issues/3
gulp.task('express-run', function () {
    server.run({
        file: 'app.js'
    });
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'js', 'server', 'express-run']);

gulp.task('build', function(callback) {
    runSequence('gulp-clean',
        ['sass', 'js'],
        callback);
});
