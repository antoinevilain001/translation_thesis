$(document).ready(function() {
    // Event listener for the button
    $('#loadTranslations').on('click', function() {
        // Make AJAX GET request to fetch translations
        $.ajax({
            url: '/getTheTranslations',  // URL of the endpoint
            type: 'GET',
            success: function(response) {
                // Empty the container before adding new data
                $('#translations-container').empty();

                // Check if there is any data in the response
                //console.log(response)
                if (response.length > 0) {
                    let htmlContent = '<ul>'; // Start an unordered list
                    // Loop through each translation in the response
                    response.forEach(function(translation) {
                        // Add each translation to the list
                        htmlContent += `
                            <li>
                                <strong>Direction:</strong> ${translation.direction}<br>
                                <strong>Text:</strong> ${translation.text}<br>
                                <strong>Translation 1 (ChatGPT):</strong> ${translation.translation1_chatGPT}<br>
                                <strong>Translation 2 (Google Translate):</strong> ${translation.translation2_googleTranslate}<br>
                                <strong>Preferred Translation:</strong> ${translation.preferred_translation}<br>
                                <strong>Preferred Translation:</strong> ${translation.date_added}<br>
                                <hr>
                            </li>
                        `;
                    });
                    htmlContent += '</ul>'; // Close the list
                    $('#translations-container').html(htmlContent); // Insert the list into the container
                } else {
                    $('#translations-container').html('<p>No translations available.</p>');
                }
            },
            error: function(xhr, status, error) {
                // Handle errors here
                console.error('Error fetching translations:', error);
                $('#translations-container').html('<p>Error loading translations.</p>');
            }
        });
    });
});