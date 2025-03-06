$(document).ready(function() {
    $('#translateForm').on('submit', function(event) { // the Google Translate handling function
        event.preventDefault();

        var user_input = $('#promptGoogleTranslate').val();
        $('#translation').html("<p><b>Processing</b></p>");
        console.log("Posted to GoogleTranslate");

        $.ajax({
            url: '/translate',
            method: 'POST',
            data: { text: user_input },
            success: function(data) {
                console.log("Ajax success");
                console.log(data);
                if (data.translated_text) {
                    $('#translation').html("<p><b>GoogleTranslate:</b> " + data.translated_text + "</p>");
                } else if (data.error) {
                    $('#translation').html("<p><b>Error:</b> " + data.error + "</p><p><b>Details:</b> " + data.details + "</p>");
                } else {
                    $('#translation').html("<p><b>Error:</b>This application received an unexpected response from google translate");
                }
            },
            error: function(data) {
                console.log("Ajax error");
                console.log(data);
                $('#translation').html("<p><b>Error: </b>the GoogleTranslate call was unsuccessful</p>");
            }
        });
    });
});