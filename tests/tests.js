var test = require('tape');
var cheerio = require('cheerio');
var parser = require('../parseemail')
var fs = require('fs');

var lyftEmail = fs.readFileSync('email1.html', 'utf-8');
var lyftEmailDom = cheerio.load(lyftEmail);

var lyftLineEmail = fs.readFileSync('email2.html', 'utf-8');
var lyftLineEmailDom = cheerio.load(lyftLineEmail);

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
    t.equal(parser.parseRideEndTime(lyftEmailDom), 'June 19 at 11:39 PM');
    t.equal(parser.parseRideEndTime(lyftLineEmailDom), 'December 5 at 8:15 PM');
    t.end();
});

test('lyft email - driver photo url', function (t) {
    t.equal(parser.parseTotalCharge(lyftEmailDom), 8);
    t.equal(parser.parseTotalCharge(lyftLineEmailDom), 11);
    t.end();
});

test('lyft email - entire email', function (t) {
    var parsedEmail = parser.parseLyftEmail(lyftEmail);
    // all the individual parsing functions are tested above, not gonna duplicate here.
    // just spot check for the expected number of fields and the first one
    t.equal(Object.keys(parsedEmail).length, 12);
    t.equal(parsedEmail['driverName'], 'Kelly');
    t.end();
});