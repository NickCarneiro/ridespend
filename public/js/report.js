var $ = require('jquery-browserify');
var fs = require('fs');
var photoTemplate = fs.readFileSync(__dirname + '/../templates/driverPhotoGrid.ms', 'utf-8');
var titleTemplate = fs.readFileSync(__dirname + '/../templates/title.ms', 'utf-8');
var firstRideTemplate = fs.readFileSync(__dirname + '/../templates/story.ms', 'utf-8');
var rideTableTemplate = fs.readFileSync(__dirname + '/../templates/table.ms', 'utf-8');
var firstDriverPhotoTemplate = fs.readFileSync(__dirname + '/../templates/firstDriverPhoto.ms', 'utf-8');

var mustache = require('mustache');
var moment = require('moment');
var numeral = require('numeral');
var numbered = require('numbered');

$(function() {
    var settings = {
        success: function(res) {
            var reportAndRides = JSON.parse(res);
            var report = reportAndRides.report;
            formatDisplayStrings(reportAndRides);
            console.log('hi');
            var renderedPhotos = mustache.render(photoTemplate, reportAndRides);
            $('#driver-photos').html(renderedPhotos);

            //var renderedTitle = mustache.render(titleTemplate, reportAndRides);
            //$('#title').html(renderedTitle);

            var firstRide = getFirstRide(reportAndRides.rides);

            var renderedFirstDriverPhoto = mustache.render(firstDriverPhotoTemplate, firstRide);
            $('#first-driver-photo').html(renderedFirstDriverPhoto);

            var additionalRides = report.totalRides - 1;
            var distanceWords = numbered.stringify(Math.round(firstRide.distance));
            var durationWords = numbered.stringify(firstRide.duration);
            distanceWords = capitalizeFirstLetter(distanceWords);
            var storyParams = {
                firstRide: firstRide,
                report: report,
                additionalRides: additionalRides,
                distanceWords: distanceWords,
                durationWords: durationWords
            };
            var firstRideHtml = mustache.render(firstRideTemplate, storyParams);
            $('#first-ride').html(firstRideHtml);

            var rideTableHtml = mustache.render(rideTableTemplate, reportAndRides);
            $('#ride-table').html(rideTableHtml);

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

var formatDisplayStrings = function(reportAndRides) {
    var rides = reportAndRides.rides;
    rides.forEach(function(ride, i) {
        ride.dateFormatted = moment(ride.rideEndTime).format('MMMM Do, YYYY');
        if (ride.tip === null) {
            ride.tip = 0;
        }
        if (ride.totalCharge === null) {
            ride.totalCharge = 0;
        }
        ride.shortPickupAddress = ride.pickupAddress.split(',')[0];
        if (!ride.shortPickupAddress) {
            ride.shortPickupAddress = ride.pickupAddress;
        }
        ride.shortDropoffAddress = ride.dropoffAddress.split(',')[0];
        if (!ride.shortDropoffAddress) {
            ride.shortDropoffAddress = ride.dropoffAddress;
        }
        ride.tipFormatted = numeral(ride.tip).format('$0.00');
        ride.totalChargeFormatted = numeral(ride.totalCharge).format('$0.00');

        if (!ride.primeTimeTip) {
            ride.primeTimeTip = '-';
        }
        if (!ride.primeTimeTipPercentage) {
            ride.primeTimeTipPercentage = '-';
        }
        if (ride.isLyftLine) {
            ride.isLyftLine = '✓';
        } else {
            ride.isLyftLine = '-';
        }

        if (!ride.duration) {
            ride.duration = '-';
        }

        if (!ride.distance) {
            ride.distance = '-';
        }
    });

};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}