var express = require('express');
var google = require('googleapis');
var config = require('../config');
var parseEmail = require('../parseemail');
var lyftReport = require('../lyftreport');


var router = express.Router();
var gmail = google.gmail('v1');

/* GET users listing. */
router.get('/', function(req, res) {
    var emailAddress = 'burthawk101@gmail.com';
    var messages = [];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);

    var authCode = req.param('code');
    var totalMessages = 0;
    var processEmails = function(error, response) {
        console.log('email results:');
        console.log(response);

        totalMessages = response.messages.length;
        var messages = [];
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
        console.log(decodedBody);
        messages.push(decodedBody);
        if (messages.length >= totalMessages) {
            console.log('received all messages');
            var parsedMessages = [];

            // Array.forEach is blocking
            messages.forEach(function(message, i) {
                var parsedLyftEmail = parseEmail.parseLyftEmail(message);
                parsedMessages.push(parsedLyftEmail);
            });
            var lyftReport = lyftReport.generateLyftReport(parsedMessages);
            res.send(JSON.stringify(lyftReport));
        }
    };

    //if (req.session.authCode) {
    //    res.send('authCode saved previously in session: ' + req.session.authCode);
    //    return;
    //}
    oauth2Client.getToken(authCode, function(err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        req.session.authCode = authCode;
        if(!err) {
            console.log('settings tokens');
            console.log(tokens);
            oauth2Client.setCredentials(tokens);
        } else {
            console.log('token error');
        }

        var params = {
            userId: emailAddress,
            q: 'from:no-reply@lyftmail.com',
            auth: oauth2Client
        };
        gmail.users.messages.list(params, processEmails);
    });

});


module.exports = router;
