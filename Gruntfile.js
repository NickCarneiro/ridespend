'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'bin/www'
      }
    },
    watchify: {
      example: {
        src: './public/**/*.js',
        dest: 'build/js/report.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'bin/www',
          'app.js',
          'routes/*.js'
        ],
        tasks: ['browserify', 'develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: [
          'public/css/*.css'
        ],
        options: {
          livereload: reloadPort
        }
      },
      views: {
        files: ['views/*.ejs'],
        options: {
          livereload: reloadPort
        }
      }
    },
    tape: {
      options: {
        pretty: true,
        output: 'console'
      },
      files: ['tests/tests.js']
    },
    copy: {
      build: {
        cwd: 'public',
        src: [ '**' ],
        dest: 'build',
        expand: true
      }
    },
    browserify: {
      client: {
        src: ['build/js/report.js'],
        dest: 'build/js/report.js'
      }
    },
    uglify: {
      my_target: {
        files: {
          'build/js/report.js': ['build/js/report.js']
        }
      }
    },
    clean: ['build']
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-watchify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-tape');

  grunt.registerTask('test', ['tape']);
  grunt.registerTask('default', [
    'watchify',
    'develop', 
    'watch'
  ]);
  grunt.registerTask('build', ['clean', 'copy', 'browserify', 'uglify'])

};
