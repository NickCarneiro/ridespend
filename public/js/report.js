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

window.onerror = function(errorMessage, url, lineNumber) {
    var error = {
        message: errorMessage,
        url: url,
        lineNumber: lineNumber
    };
    $.post('/jserror', error);
};

$(function() {
    var settings = {
        success: function(res) {
            var reportAndRides = JSON.parse(res);
            var report = reportAndRides.report;
            formatDisplayStrings(reportAndRides);
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

            google.maps.event.addDomListener(window, 'load', initializeMap.bind(reportAndRides));
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
            ride.primeTimeTipFormatted = '-';
        } else {
            ride.primeTimeTipFormatted = numeral(ride.primeTimeTip).format('$0.00');
        }
        if (!ride.primeTimeTipPercentage) {
            ride.primeTimeTipPercentageFormatted = '-';
        } else {
            ride.primeTimeTipPercentageFormatted = numeral(ride.primeTimeTipPercentage).divide(100).format('0%');
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


function initializeMap() {
    var mapOptions = {
        center: { lat: -34.397, lng: 150.644},
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById('google-map'),
        mapOptions);
    var rides = this.rides;
    geocodeRides(rides, map);
}

function geocodeRides(rides, map) {
    geocoder = new google.maps.Geocoder();
    var firstRide = getFirstRide(rides);

    geocoder.geocode({'address': firstRide.pickupAddress}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            firstRide.pickupLocation = results[0].geometry.location;
        } else if (statis == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            console.log('over query limit')
        }
    });

    geocoder.geocode({'address': firstRide.dropoffAddress}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            firstRide.dropoffLocation = results[0].geometry.location;
            connectPickupAndDropoffLocations(firstRide, map);
        } else if (statis == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            console.log('over query limit')
        }
    });
}


/**
 * draws a line between 2 markers on a map if they both exist
 */
function connectPickupAndDropoffLocations(ride, map) {
    if (!ride.pickupLocation || !ride.dropoffLocation) {
        return;
    }
    new google.maps.Polyline({
        path: [ride.pickupLocation, ride.dropoffLocation],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });

    // zoom to include pickup and dropoff
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(ride.pickupLocation);
    bounds.extend(ride.dropoffLocation);
    map.fitBounds(bounds);
}