var $ = require('jquery-browserify');
var fs = require('fs');
var photoTemplate = fs.readFileSync(__dirname + '/../templates/driverphoto.ms', 'utf-8');
var titleTemplate = fs.readFileSync(__dirname + '/../templates/title.ms', 'utf-8');
var firstRideTemplate = fs.readFileSync(__dirname + '/../templates/first.ms', 'utf-8');
var mustache = require('mustache');
$(function() {
    var settings = {
        success: function(res) {
            var reportAndRides = JSON.parse(res);
            console.log('hi');
            var renderedPhotos = mustache.render(photoTemplate, reportAndRides);
            $('#driver-photos').html(renderedPhotos);

            var renderedTitle = mustache.render(titleTemplate, reportAndRides);
            $('#title').html(renderedTitle);

            var firstRide = getFirstRide(reportAndRides.rides);
            var firstRideHtml = mustache.render(firstRideTemplate, firstRide);
            $('#first-ride').html(firstRideHtml);

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

var getFirstRide = function(rides) {
    return rides[rides.length - 1];
};