$(document).ready(function() {
    $('#translateForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#prompt').val();
        $('#translation').html("<p><b>Processing</b></p>");

        $.ajax({
            url: '/askDeepL',
            method: 'POST',
            data: { prompt: user_input, option: "eng_to_spa" },
            success: function(data) {
                $('#translation').html("<p>"+JSON.stringify(data)+"</p>");
            },
            error: function(data) {
                $('#translation').html("<p>Error: "+JSON.stringify(data)+"</p>");
            }
        });
    });
});