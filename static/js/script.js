$(document).ready(function() {
    $('#bothForm').on('submit', function(event) { // the ChatGPT handling function
        event.preventDefault();

        var user_input = $('#prompt').val();
        var language_sel = $('input[name="choice"]:checked').val(); 
        $('#ChatGPT_header').removeClass('d-none');
        $('#ChatGPT_response').html("ChatGPT Processing");
        $('#GoogleTranslate_header').removeClass('d-none');
        $('#GoogleTranslate_response').html("GoogleTranslate Processing");
        $('#Comparison').html("Comparison waiting"); // won't do anything since it's still hidden

        var phrase_to_translate = user_input;
        var googleTranslate_translation;
        var chatGPT_translation;

        let ajax1 = $.ajax({ // call ChatGPT
            url: '/askChatGPT',
            method: 'POST',
            data: { prompt: user_input, option: language_sel },
            success: function(data) {
                if (data.response) {
                    $('#ChatGPT_response').html(data.response);
                    chatGPT_translation = data.response;
                } else if (data.error) {
                    $('#ChatGPT_response').html("<b>Error:</b> " + data.error);
                } else {
                    $('#ChatGPT_response').html("<b>Error:</b> This application received an unexpected response.");
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
                    $('#GoogleTranslate_response').html(data.translated_text);
                    googleTranslate_translation = data.translated_text;
                } else if (data.error) {
                    $('#GoogleTranslate_response').html("<b>Error:</b> " + data.error + ", <b>Details:</b> " + data.details);
                } else {
                    $('#GoogleTranslate_response').html("<b>Error:</b> This application received an unexpected response from google translate");
                }
            },
            error: function(data) {
                console.log("Ajax error");
                console.log(data);
                $('#GoogleTranslate_response').html("<b>Error: </b>the GoogleTranslate call was unsuccessful.");
            }
        });
        // Execute the third AJAX request only after the first two complete
        Promise.all([ajax1, ajax2]).then(function(responses) {
            // Both ajax1 and ajax2 have completed, now execute the third AJAX request
            $('#Comparison_header').removeClass('d-none');
            $('#Comparison').html("processing");
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
                        $('#Comparison').html(data.response);
                    } else if (data.error) {
                        $('#Comparison').html("<b>Error:</b> " + data.error);
                    } else {
                        $('#Comparison').html("<b>Error:</b> This application received an unexpected response.");
                    }
                }
            });
            // Show the hidden buttons
            $('#responseButtons').removeClass('d-none');
        }).catch(function(error) {
            console.log("An error occurred:", error);
        });
    });
    // Targeting buttons inside #responseButtons1 container
    $('#responseButtons button').click(function() {
        // You can access the specific button that was clicked using `this`
        var buttonText = $(this).text(); // Get the text of the clicked button
        var action = $(this).data('action');
        $('#submissionResponse').html("<p><b>Submitted " + buttonText + "!</b></p>");

        // Perform logic based on which button was clicked
        console.log(action);
        var user_input = $('#prompt').val();
        var language_sel = $('input[name="choice"]:checked').val();
        var googleTranslate = $('#GoogleTranslate_response').text();
        var chatGPT = $('#ChatGPT_response').text();
        let data = {
            user_input: user_input,
            language_sel: language_sel,
            googleTranslate: googleTranslate,
            chatGPT: chatGPT,
            preferred_translation: action
        };
        console.log(data);
        $.ajax({ // call Google Translate
            url: '/addToDB',
            method: 'POST',
            data: data,
            success: function(response) {
                console.log("Ajax success");
                console.log(response);
            },
            error: function(xhr, status, error) {
                // Handle errors here
                console.error('Error fetching translations:', error);
                $('#creationResponse').html('<p>Error loading translations.</p>');
            }
        });

    });
});