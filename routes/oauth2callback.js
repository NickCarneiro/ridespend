var express = require('express');
var google = require('googleapis');
var config = require('../config');


var router = express.Router();
var gmail = google.gmail('v1');

/* GET users listing. */
router.get('/', function(req, res) {
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);

    var authCode = req.param('code');

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

        var emailAddress = 'burthawk101@gmail.com';
        var processEmails = function(error, response) {
            console.log('email results:');
            console.log(response);
            res.send('got emails');
        };
        var params = {
            userId: emailAddress,
            q: 'from:no-reply@lyftmail.com',
            auth: oauth2Client
        };
        gmail.users.messages.list(params, processEmails);
    });

});

module.exports = router;
