$(document).ready(function() {
    $('#translateForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#prompt').val();
        $('#translation').html("<p><b>Processing</b></p>");

        $.ajax({
            url: '/askDeepL',
            method: 'POST',
            data: { prompt: user_input },
            success: function(data) {
                $('#translation').html("<p>"+data.hey+"</p>");
            }
        });
    });
});