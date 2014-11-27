var express = require('express');
var google = require('googleapis');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {

  var OAuth2 = google.auth.OAuth2;

  var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);


  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });
  res.render('index', { title: 'WOOOO', authUrl: url });
});

module.exports = router;
