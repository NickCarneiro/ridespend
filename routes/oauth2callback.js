var express = require('express');
var google = require('googleapis');
var config = require('../config');



var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res) {

    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);

    var authCode = req.param('code');

    oauth2Client.getToken(authCode, function(err, tokens) {
        if (!err) {
            // Now tokens contains an access_token and an optional refresh_token. Save them.
            req.session.tokens = tokens;
            console.log('setting tokens');
            console.log(tokens);

        } else {
            console.log('token error');
        }
        res.render('report', { title: 'Lyft and Uber Spending Report', authUrl: url });
    });
});


module.exports = router;
