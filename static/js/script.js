$(document).ready(function() {
    $('#bothForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#prompt').val();
        var language_sel = $('input[name="choice"]:checked').val(); 
        console.log(language_sel)
        $('#ChatGPT_response').html("<p><b>ChatGPT Processing</b></p>");
        $('#GoogleTranslate_response').html("<p><b>GoogleTranslate Processing</b></p>");

        var phrase_to_translate = user_input;
        var googleTranslate_translation;
        var chatGPT_translation;

        $.ajax({ // call ChatGPT
            url: '/askChatGPT',
            method: 'POST',
            data: { prompt: user_input, option: language_sel },
            success: function(data) {
                if (data.response) {
                    $('#ChatGPT_response').html("<p><b>ChatGPT:</b> " + data.response + "</p>");
                    chatGPT_translation = data.response;
                } else if (data.error) {
                    $('#ChatGPT_response').html("<p><b>Error:</b> " + data.error + "</p>");
                } else {
                    $('#ChatGPT_response').html("<p><b>This application received an unexpected response</b> ");
                }
            }
        });
        $.ajax({ // call Google Translate
            url: '/askGoogleTranslate',
            method: 'POST',
            data: { text: user_input, option: language_sel },
            success: function(data) {
                console.log("Ajax success");
                console.log(data);
                if (data.translated_text) {
                    $('#GoogleTranslate_response').html("<p><b>GoogleTranslate:</b> " + data.translated_text + "</p>");
                    googleTranslate_translation = data.translated_text;
                } else if (data.error) {
                    $('#GoogleTranslate_response').html("<p><b>Error:</b> " + data.error + "</p><p><b>Details:</b> " + data.details + "</p>");
                } else {
                    $('#GoogleTranslate_response').html("<p><b>Error:</b>This application received an unexpected response from google translate");
                }
            },
            error: function(data) {
                console.log("Ajax error");
                console.log(data);
                $('#GoogleTranslate_response').html("<p><b>Error: </b>the GoogleTranslate call was unsuccessful</p>");
            }
        });
        /* $.ajax({ // call compare
            url: '/compareResponses',
            method: 'POST',
            data: { prompt: user_input, option: language_sel },
            success: function(data) {
                if (data.response) {
                    $('#ChatGPT_response').html("<p><b>ChatGPT:</b> " + data.response + "</p>");
                } else if (data.error) {
                    $('#ChatGPT_response').html("<p><b>Error:</b> " + data.error + "</p>");
                } else {
                    $('#ChatGPT_response').html("<p><b>This application received an unexpected response</b> ");
                }
            }
        }); */
    });
    $('#chatForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#promptChatGPT').val();
        $('#Comparison').html("<p><b>Processing</b></p>");

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