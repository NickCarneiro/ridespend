var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var server = require('gulp-express');
var sass = require('gulp-sass');


// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build'], cb);
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
        .pipe(gulp.dest('./build/css'));
});

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run({
        file: 'bin/www'
    });
    livereload.listen();
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'js', 'server']);