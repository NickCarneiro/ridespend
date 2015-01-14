var $ = require('jquery-browserify');
var fs = require('fs');
var photoTemplate = fs.readFileSync(__dirname + '/../templates/driverphoto.ms', 'utf-8');
var titleTemplate = fs.readFileSync(__dirname + '/../templates/title.ms', 'utf-8');
var mustache = require('mustache');
$(function() {
    var settings = {
        success: function(res) {
            var rides = JSON.parse(res);
            console.log('hi');
            var renderedPhotos = mustache.render(photoTemplate, rides);
            $('#driver-photos').html(renderedPhotos);

            var renderedTitle = mustache.render(titleTemplate, rides);
            $('#title').html(renderedTitle);
            $('#message').empty();
            console.log(res);
        },
        error: function(e) {
            $('#message').text('error loading report');
            console.log(e);
        }
    };
    $('#message').text('Downloading emails...');
    $.ajax('/api/report', settings);
});