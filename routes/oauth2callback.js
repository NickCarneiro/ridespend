var express = require('express');
var google = require('googleapis');
var config = require('../config');



var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res) {

    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);

    var authCode = req.param('code');
    // typically the code param contains an authorization token from google.
    // if it contains 'test', then set the token value to a magic value. If the
    // report.js sees this value it sends dummy data for testing.
    if (authCode === 'test') {
        req.session.tokens = 'test';
        res.render('report', { title: 'Lyft and Uber Spending Report'});
        return;
    }
    oauth2Client.getToken(authCode, function(err, tokens) {
        if (!err) {
            // Now tokens contains an access_token and an optional refresh_token. Save them.
            req.session.tokens = tokens;
            console.log('setting tokens');
            console.log(tokens);

        } else {
            console.log(err);
            console.log('error getting tokens');
        }
        res.render('report', { title: 'Lyft and Uber Spending Report'});
    });
});


module.exports = router;
