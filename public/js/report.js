var $ = require('jquery-browserify');
$(function() {
    var settings = {
        success: function(res) {
            console.log(res);
        },
        error: function(e) {
            console.log(e);
        }
    };
    $.ajax('/report', settings)
});