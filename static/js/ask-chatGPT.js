$(document).ready(function() {
    $('#chatForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#promptChatGPT').val();
        $('#response').html("<p><b>Processing</b></p>");

        $.ajax({
            url: '/ask',
            method: 'POST',
            data: { prompt: user_input },
            success: function(data) {
                if (data.response) {
                    $('#response').html("<p><b>ChatGPT:</b> " + data.response + "</p>");
                } else if (data.error) {
                    $('#response').html("<p><b>Error:</b> " + data.error + "</p>");
                } else {
                    $('#response').html("<p><b>This application received an unexpected response</b> ");
                }
            }
        });
    });
});