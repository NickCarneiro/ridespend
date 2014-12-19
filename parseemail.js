var S = require('string');
var cheerio = require('cheerio');


/**
 * Takes an email string, spits out a nice object with nonnull fields
 * @param html utf-8 string containg html version of email
 */
var parseLyftEmail = function(html) {
    var lyftEmailDom = cheerio.load(html);
    var parsedEmail = {};
    var lyftEmailFields = {
        driverName: parseDriverName,
        pickupAddress: parsePickupAddress,
        dropoffAddress: parseDropoffAddress,
        distance: parseDistance,
        duration: parseDuration,
        tip: parseTip,
        primeTimeTip: parsePrimeTimeTip,
        isLyftLine: parseIsLyftLine,
        primeTimeTipPercentage: parsePrimeTimeTipPercentage,
        totalCharge: parseTotalCharge,
        rideEndTime: parseRideEndTime,
        driverPhotoUrl: parseDriverPhotoUrl,
        isCanceled: parseIsCanceled
    };

    for (var k in lyftEmailFields) {
        try {
            parsedEmail[k] = lyftEmailFields[k](lyftEmailDom);
        } catch (e) {
            parsedEmail[k] = null;
            console.log(e);
        }
    }
    // the cost of the ride is arguable the most important piece of info.
    // if we're missing it, disregard this ride because we're probably missing the other info too.
    if (parsedEmail.totalCharge === null && !parsedEmail.isCanceled) {
        return null;
    } else {
        return parsedEmail
    }
};

var parseDriverName = function($) {
    // lyft line email uses an h3
    var nameText = $('h1:contains("Thanks for")').text() || $('h3:contains("Thanks for")').text();
    var driverName = S(nameText).between('Thanks for riding with ', '!').toString();
    return driverName;
};

var parsePickupAddress = function($) {
    return $('td:contains("Pickup:")').next().text().trim();
};

var parseDropoffAddress = function($) {
    return $('td:contains("Dropoff:")').next().text().trim();
};


// Distance and duration are not available for Lyft Lines so return null in those cases to suppress exception.
var parseDistance = function($) {
    var distanceString = $('i:contains("mi &")').last().html();
    if (distanceString === null) {
        return null;
    }
    // '0.7 mi &amp; 4 min'
    var ampersandIndex = distanceString.indexOf('&amp;');
    var distanceMilesString = distanceString.substring(0, ampersandIndex);
    var distanceMilesFloat = parseFloat(distanceMilesString);
    return distanceMilesFloat;
};

var parseDuration = function($) {
    var distanceAndDuration = $('i:contains("mi &")').last().html();
    if (distanceAndDuration === null) {
        return null;
    }
    // '0.7 mi &amp; 4 min'
    var durationString = distanceAndDuration.split(';')[1].replace(' min', '');
    var durationMinutes = parseInt(durationString);
    return durationMinutes;
};

var parseTip = function($) {
    var tipRow = $('tr:contains("Tip:")').last();
    // todo: multi-currency
    var tipAmount = tipRow.children().last().text().replace('$', '');
    // warning: floats for money
    return parseFloat(tipAmount) || null;
};

var parsePrimeTimeTip = function($) {
    var tipRow = $('tr:contains("Prime Time Tip*:")').last();
    // todo: multi-currency
    var tipAmount = tipRow.children().last().text().replace('$', '');
    // warning: floats for money
    return parseFloat(tipAmount) || null;
};

var parseIsLyftLine = function($) {
    return $('td:contains("Lyft Line:")').length > 0;
};

var parsePrimeTimeTipPercentage = function($) {
    var percentageCell = $('td:contains("Prime Time Tip was included ")').last().text();
    var percentage = S(percentageCell).between('A ', '%');
    return parseInt(percentage) || null;
};

var parseTotalCharge = function($) {
    var totalRow = $('tr:contains("Total charged to")').last();
    var totalAmount = totalRow.children().last().text().replace('$', '');
    // warning: floats for money
    return parseFloat(totalAmount);
};

var parseRideEndTime = function($) {
    var rideEndDateString = $('i:contains("Ride ending ")').last().text().replace('Ride ending ', '');
    // slightly different selector for lyft lines and newer emails
    if (!rideEndDateString) {
        rideEndDateString = $('p:contains("Line ending ")').last().text().replace('Line ending ', '');
    }
    if (!rideEndDateString) {
        rideEndDateString = $('p:contains("Ride ending ")').last().text().replace('Ride ending ', '');
    }
    //todo: figure out time zone and return a true date
    return rideEndDateString;
};

var parseDriverPhotoUrl = function($) {
    return $('img[alt*="Photo of"]').attr('src');
};


var parseIsCanceled = function($) {
    //todo: multicurrency
    return $('h1:contains("$5 Cancelation fee")').length > 0;
};

module.exports = {
    parseDriverName: parseDriverName,
    parsePickupAddress: parsePickupAddress,
    parseDropoffAddress: parseDropoffAddress,
    parseDistance: parseDistance,
    parseDuration: parseDuration,
    parseTip: parseTip,
    parsePrimeTimeTip: parsePrimeTimeTip,
    parseIsLyftLine: parseIsLyftLine,
    parsePrimeTimeTipPercentage: parsePrimeTimeTipPercentage,
    parseTotalCharge: parseTotalCharge,
    parseRideEndTime: parseRideEndTime,
    parseDriverPhotoUrl: parseDriverPhotoUrl,
    parseLyftEmail: parseLyftEmail,
    parseIsCanceled: parseIsCanceled
};