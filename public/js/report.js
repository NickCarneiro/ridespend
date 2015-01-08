var $ = require('jquery-browserify');
$(function() {
    var settings = {
        success: function(res) {
            $('#message').text('report loaded');
            console.log(res);
        },
        error: function(e) {
            $('#message').text('error loading report');
            console.log(e);
        }
    };
    $('#message').text('Downloading emails...');
    $.ajax('/api/report', settings)
});