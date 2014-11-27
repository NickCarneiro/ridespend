var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    var authCode = req.param('code');
    res.send('oauth2 callback page ' + authCode);
});

module.exports = router;
