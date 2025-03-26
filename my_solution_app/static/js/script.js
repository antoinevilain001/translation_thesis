$(document).ready(function() {
    $('#bothForm').on('submit', function(event) { // the handling function
        event.preventDefault();

        // blank out inputs from previous question
        $('#submissionResponse').html("");
        $('#rate_GoogleTranslate').addClass('d-none');
        $('#rate_ChatGPT').addClass('d-none');
        $('#rate_DeepL').addClass('d-none');
        $('#responseButtons').addClass('d-none'); // hide the buttons

        // get inputs and start processing
        var user_input = $('#prompt').val();
        var language_sel = $('input[name="choice"]:checked').val(); 
        $('#ChatGPT_header').removeClass('d-none');
        $('#ChatGPT_response').html("ChatGPT Processing");
        $('#GoogleTranslate_header').removeClass('d-none');
        $('#GoogleTranslate_response').html("GoogleTranslate Processing");
        $('#DeepL_header').removeClass('d-none');
        $('#DeepL_response').html("DeepL Processing");

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
        let ajax3 = $.ajax({
            url: '/askDeepL',
            method: 'POST',
            data: { prompt: user_input, option: "eng_to_spa" },
            success: function(data) {
                $('#DeepL_response').html(data.translated_text);
            },
            error: function(data) {
                $('#DeepL_response').html("<p>Error: "+JSON.stringify(data)+"</p>");
            }
        });
        // Execute the third AJAX request only after the first two complete
        Promise.all([ajax1, ajax2, ajax3]).then(function(responses) {
            // Show the hidden buttons
            $('#responseButtons').removeClass('d-none');
            $('#rate_GoogleTranslate').removeClass('d-none');
            $('#rate_ChatGPT').removeClass('d-none');
            $('#rate_DeepL').removeClass('d-none');

        }).catch(function(error) {
            console.log("An error occurred:", error);
        });
    });
    // Targeting buttons inside #responseButtons1 container
   // Add event listener to the submit button
    document.getElementById('submit-rating').addEventListener('click', function(event) {
        event.preventDefault();  // Prevent the form from submitting (page refresh)

        // Initialize an array to store the ratings
        const ratings = [];

        // Loop through each set of radio buttons
        for (let i = 1; i <= 3; i++) {
            const selectedRating = document.querySelector(`input[name="rating-${i}"]:checked`);
            
            if (selectedRating) {
                // If a rating is selected, store it in the ratings array
                ratings.push({ set: i, rating: selectedRating.value });
            } else {
                // If no rating is selected, store null or a default value
                ratings.push({ set: i, rating: null });
            }
        }

        // Print the ratings to the console (you can modify this part to send to a server or further processing)
        console.log('Ratings:', ratings);

        // Optionally, display the ratings on the page (for testing)
        alert('Ratings: ' + JSON.stringify(ratings));
    });
});