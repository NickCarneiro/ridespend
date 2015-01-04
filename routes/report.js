var express = require('express');
var router = express.Router();
var google = require('googleapis');
var parseEmail = require('../parseemail');
var lyftReport = require('../lyftreport');
var config = require('../config');

var gmail = google.gmail('v1');
var emailAddress = 'burthawk101@gmail.com';
var messages = [];
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);

/* GET users listing. */
router.get('/', function(req, res) {
    var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);
    oauth2Client.setCredentials(tokens);
    var params = {
        userId: emailAddress,
        q: 'from:no-reply@lyftmail.com OR from:receipts@lyftmail.com ',
        auth: oauth2Client
    };
    gmail.users.messages.list(params, processEmails);
});

var totalMessages = 0;
var processEmails = function(error, response) {
    totalMessages = response.messages.length;
    response.messages.forEach(function(message) {
        console.log('downloading message ' + message.id);
        var params = {
            userId: emailAddress,
            id: message.id,
            auth: oauth2Client
        };
        gmail.users.messages.get(params, handleMessageResponse);
    });
};

var handleMessageResponse = function(error, response) {
    console.log('received message: ' + messages.length);

    var encodedBody = response.payload.parts[1].body.data;
    var decodedBody = new Buffer(encodedBody, 'base64').toString('utf-8');
    messages.push(decodedBody);
    if (messages.length >= totalMessages) {
        console.log('received all messages');
        var parsedMessages = [];

        // Array.forEach is blocking
        messages.forEach(function(message, i) {
            var parsedLyftEmail = parseEmail.parseLyftEmail(message);
            if (parsedLyftEmail !== null) {
                parsedMessages.push(parsedLyftEmail);
            }
        });
        var report = lyftReport.generateLyftReport(parsedMessages);
        var reportAndRides = {
            report: report,
            rides: parsedMessages
        };
        res.send(JSON.stringify(reportAndRides));
    }
};

module.exports = router;
