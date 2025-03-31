function decodeHTMLEntities(text) {
    let textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}
function filterText(text) {
    text = decodeHTMLEntities(text);
    text = text.replace(/["“”]/g, '');
    text = text.replace(/’/g, "'");
    return text;
}

$(document).ready(function() {
    var user_input;
    var language_sel;
    var category;
    var googleTranslate_translation;
    var chatGPT_translation;
    var chatGPTmini_translation;
    var deepL_translation;
    $('#bothForm').on('submit', function(event) { // the handling function
        event.preventDefault();

        // blank out inputs from previous question
        $('#submissionResponse').html("");
        $('#creationResponse').html("");
        $('#rate_GoogleTranslate').addClass('d-none');
        $('#rate_ChatGPT').addClass('d-none');
        $('#rate_DeepL').addClass('d-none');
        $('#responseButtons').addClass('d-none'); // hide the buttons

        // get inputs and start processing
        user_input = $('#prompt').val().replace(/["“”]/g, '');
        user_input = filterText(user_input);
        category = $('#category').val();
        language_sel = $('input[name="choice"]:checked').val(); 
        $('#ChatGPT_header').removeClass('d-none');
        $('#ChatGPT_response').html("ChatGPT Processing");
        $('#ChatGPTmini_header').removeClass('d-none');
        $('#ChatGPTmini_response').html("ChatGPTmini Processing");
        $('#GoogleTranslate_header').removeClass('d-none');
        $('#GoogleTranslate_response').html("GoogleTranslate Processing");
        $('#DeepL_header').removeClass('d-none');
        $('#DeepL_response').html("DeepL Processing");
        // Show the hidden buttons
        $('#rate_GoogleTranslate').removeClass('d-none');
        $('#rate_ChatGPT').removeClass('d-none');
        $('#rate_ChatGPTmini').removeClass('d-none');
        $('#rate_DeepL').removeClass('d-none');

        var phrase_to_translate = user_input;

        let ajax0 = $.ajax({ // call ChatGPT
            url: '/askChatGPT',
            method: 'POST',
            data: { prompt: user_input, option: language_sel, model: "gpt-4o-mini" },
            success: function(data) {
                if (data.response) {
                    $('#ChatGPTmini_response').html(data.response);
                    chatGPT_translation = data.response; //** This is a bug that has been worked around, this should be mini
                } else if (data.error) {
                    $('#ChatGPTmini_response').html("<b>Error:</b> " + data.error);
                } else {
                    $('#ChatGPTmini_response').html("<b>Error:</b> This application received an unexpected response.");
                }
            }
        });
        let ajax1 = $.ajax({ // call ChatGPT advanced model
            url: '/askChatGPT',
            method: 'POST',
            data: { prompt: user_input, option: language_sel, model: "gpt-4o" },
            success: function(data) {
                if (data.response) {
                    $('#ChatGPT_response').html(data.response);
                    chatGPTmini_translation = data.response; //** This is a bug that has been worked around, this should not be mini
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
            data: { prompt: user_input, option: language_sel },
            success: function(data) {
                $('#DeepL_response').html(data.translated_text);
                deepL_translation = data.translated_text;
            },
            error: function(data) {
                $('#DeepL_response').html("<p>Error: "+JSON.stringify(data)+"</p>");
            }
        });
        // Execute the third AJAX request only after the first two complete
        Promise.all([ajax1, ajax2, ajax3]).then(function(responses) {
            console.log("Success.");
            // Show hidden button
            $('#responseButtons').removeClass('d-none');
        }).catch(function(error) {
            console.log("An error occurred:", error);
        });
    });
    // Targeting buttons inside #responseButtons1 container
   // Add event listener to the submit button
    document.getElementById('submit-rating').addEventListener('click', function(event) {
        event.preventDefault();  // Prevent the form from submitting (page refresh)
        $('#submissionResponse').html('<b>Submitting Response...</b>');

        // Initialize an array to store the ratings
        const ratings = [];

        // Loop through each set of radio buttons
        for (let i = 0; i <= 3; i++) {
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
        //console.log('Ratings:', ratings);

        var chatGPT_rating = ratings[2];
        var chatGPTmini_rating = ratings[0];
        var googleTranslate_rating = ratings[1];
        var deepL_rating = ratings[3];

        console.log("Original Google Translate Translation:", googleTranslate_translation);
        let filtered_googleTranslate = filterText(googleTranslate_translation);
        console.log("Filtered Google Translate Translation:", filtered_googleTranslate);

        console.log("Original ChatGPT Translation:", chatGPT_translation);
        let filtered_chatGPT = filterText(chatGPT_translation);
        console.log("Filtered ChatGPT Translation:", filtered_chatGPT);

        console.log("Original ChatGPT Mini Translation:", chatGPTmini_translation);
        let filtered_chatGPTmini = filterText(chatGPTmini_translation);
        console.log("Filtered ChatGPT Mini Translation:", filtered_chatGPTmini);

        console.log("Original DeepL Translation:", deepL_translation);
        let filtered_deepL = filterText(deepL_translation);
        console.log("Filtered DeepL Translation:", filtered_deepL);

        // Construct the data object with filtered values
        data = {
            prompt: user_input,
            option: language_sel,
            category: category,
            googleTranslate_translation: filtered_googleTranslate,
            googleTranslate_rating: googleTranslate_rating.rating,
            chatGPT_translation: filtered_chatGPT,
            chatGPT_rating: chatGPT_rating.rating,
            chatGPTmini_translation: filtered_chatGPTmini,
            chatGPTmini_rating: chatGPTmini_rating.rating,
            deepL_translation: filtered_deepL,
            deepL_rating: deepL_rating.rating
        };

        $.ajax({ // call Google Translate
            url: '/addToDB',
            method: 'POST',
            data: data,
            success: function(response) {
                console.log("Ajax success");
                console.log(response);
                $('#submissionResponse').html('<b>Submitted!</b>');
                $('#creationResponse').html('<p>Translation stored successfully.</p>');
            },
            error: function(xhr, status, error) {
                // Handle errors here
                console.error('Error fetching translations:', error);
                $('#creationResponse').html('<p>Error loading translations.</p>');
            }
        });

        //console.log(data);

        // Optionally, display the ratings on the page (for testing)
        //alert('Ratings: ' + JSON.stringify(data));
    });
});