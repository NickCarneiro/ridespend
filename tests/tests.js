'use strict';
var fs = require('fs');
var test = require('tape');
var cheerio = require('cheerio');
var parser = require('../parseemail');
var lyftReport = require('../lyftreport');

var lyftEmail = fs.readFileSync(__dirname + '/email1.html', 'utf-8');
var lyftEmailDom = cheerio.load(lyftEmail);

var lyftLineEmail = fs.readFileSync(__dirname + '/email2.html', 'utf-8');
var lyftLineEmailDom = cheerio.load(lyftLineEmail);

var primeTimeAndRegularTipEmail = fs.readFileSync(__dirname + '/email3.html', 'utf-8');

var canceledLyftEmail = fs.readFileSync(__dirname + '/email4.html', 'utf-8');
var canceledLyftEmailDom = cheerio.load(canceledLyftEmail);

test('lyft email - driver name', function (t) {
    t.equal(parser.parseDriverName(lyftEmailDom), 'Kelly');
    t.equal(parser.parseDriverName(lyftLineEmailDom), 'Azam');
    t.end();
});

test('lyft email - pickup address', function (t) {
    t.equal(parser.parsePickupAddress(lyftEmailDom), '1004 San Marcos Street, Austin, TX 78702, USA');
    t.end();
});

test('lyft email - dropoff address', function (t) {
    t.equal(parser.parseDropoffAddress(lyftEmailDom), '652 Red River Street, Austin, TX 78701, USA');
    t.end();
});

test('lyft email - distance', function (t) {
    t.equal(parser.parseDistance(lyftEmailDom), 0.7);
    t.end();
});

test('lyft email - duration', function (t) {
    t.equal(parser.parseDuration(lyftEmailDom), 4);
    t.end();
});

test('lyft email - tip', function (t) {
    t.equal(parser.parseTip(lyftEmailDom), null);
    t.equal(parser.parseTip(lyftLineEmailDom), 1);
    t.end();
});

test('lyft email - prime time tip', function (t) {
    t.equal(parser.parsePrimeTimeTip(lyftEmailDom), 3);
    t.equal(parser.parsePrimeTimeTip(lyftLineEmailDom), null);
    t.end();
});

test('lyft email - is lyft line', function (t) {
    t.equal(parser.parseIsLyftLine(lyftEmailDom), false);
    t.equal(parser.parseIsLyftLine(lyftLineEmailDom), true);
    t.end();
});

test('lyft email - prime time tip percentage', function (t) {
    t.equal(parser.parsePrimeTimeTipPercentage(lyftEmailDom), 75);
    t.equal(parser.parsePrimeTimeTipPercentage(lyftLineEmailDom), null);
    t.end();
});

test('lyft email - total charge', function (t) {
    t.equal(parser.parseTotalCharge(lyftEmailDom), 8);
    t.equal(parser.parseTotalCharge(lyftLineEmailDom), 11);
    t.end();
});

test('lyft email - ride end time', function (t) {
    var expectedDate = new Date(2014, 5, 19, 23, 39);
    var actualDate = parser.parseRideEndTime(lyftEmailDom);
    // the plus is a hack to convert dates to millis
    t.equal(+actualDate, +expectedDate);

    var expectedDate2 = new Date(2014, 11, 5, 20, 15);
    var actualDate2 = parser.parseRideEndTime(lyftLineEmailDom);
    t.equal(+actualDate2, +expectedDate2);
    t.end();
});

test('lyft email - driver photo url', function (t) {
    t.equal(parser.parseTotalCharge(lyftEmailDom), 8);
    t.equal(parser.parseTotalCharge(lyftLineEmailDom), 11);
    t.end();
});

test('lyft email - ride canceled', function (t) {
    t.equal(parser.parseIsCanceled(canceledLyftEmailDom), true);
    t.equal(parser.parseIsCanceled(lyftLineEmailDom), false);
    t.equal(parser.parseIsCanceled(lyftEmailDom), false);
    t.end();
});

test('lyft email - entire email', function (t) {
    var parsedEmail = parser.parseLyftEmail(lyftEmail);
    // all the individual parsing functions are tested above, not gonna duplicate here.
    // just spot check for the expected number of fields and the first one
    t.equal(Object.keys(parsedEmail).length, 13);
    t.equal(parsedEmail['driverName'], 'Kelly');
    t.end();
});

test('lyft report - two emails', function(t) {
    var parsedLyftEmail = parser.parseLyftEmail(lyftEmail);
    var parsedLyftLineEmail = parser.parseLyftEmail(lyftLineEmail);
    var parsedPrimeTimeAndRegularTipEmail = parser.parseLyftEmail(primeTimeAndRegularTipEmail);
    var emailList = [parsedLyftEmail, parsedLyftLineEmail, parsedPrimeTimeAndRegularTipEmail];

    var report = lyftReport.generateLyftReport(emailList);
    var expectedReport = { totalRides: 3,
        totalCost: '$28.00',
        averageCost: '$9.33',
        mostExpensiveRide: 1,
        leastExpensiveRide: 0,
        longestRide: 2,
        shortestRide: 0,
        totalDistanceTraveled: '1.9',
        totalDuration: '10',
        averageDuration: '5',
        lyftLineCount: 1,
        primeTimeTipTotal: '$4.00',
        primeTimeCount: 2,
        averagePrimeTimeTipAmount: '$2.00',
        totalVoluntaryTipAmount: '$3.00',
        averageVoluntaryTipAmount: '$1.50',
        canceledRideCount: 0,
        averageRideDistance: '0.95',
        averageOverallTipAmount: '$2.33'
    };

    t.deepEquals(report, expectedReport);
    t.end();

});