$(document).ready(function() {
    $('#bothForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#prompt').val();
        var language_sel = $('input[name="choice"]:checked').val(); 
        console.log(language_sel)
        $('#ChatGPT_response').html("<p><b>ChatGPT Processing</b></p>");
        $('#GoogleTranslate_response').html("<p><b>GoogleTranslate Processing</b></p>");
        $('#Comparison').html("<p><b>Comparison waiting</b></p>");

        var phrase_to_translate = user_input;
        var googleTranslate_translation;
        var chatGPT_translation;

        let ajax1 = $.ajax({ // call ChatGPT
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
        let ajax2 = $.ajax({ // call Google Translate
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
        // Execute the third AJAX request only after the first two complete
        Promise.all([ajax1, ajax2]).then(function(responses) {
            // Both ajax1 and ajax2 have completed, now execute the third AJAX request
            $('#Comparison').html("<p><b>Comparison processing</b></p>");
            $.ajax({ // call compare
                url: '/compareResponses',
                method: 'POST',
                data: {
                    phrase_to_translate: phrase_to_translate,
                    googleTranslate_translation: googleTranslate_translation,
                    chatGPT_translation: chatGPT_translation,
                    option: language_sel
                },
                success: function(data) {
                    if (data.response) {
                        $('#Comparison').html("<p><b>Comparison:</b> " + data.response + "</p>");
                    } else if (data.error) {
                        $('#Comparison').html("<p><b>Error:</b> " + data.error + "</p>");
                    } else {
                        $('#Comparison').html("<p><b>This application received an unexpected response</b> ");
                    }
                }
            });
        }).catch(function(error) {
            console.log("An error occurred:", error);
        });
    });
});