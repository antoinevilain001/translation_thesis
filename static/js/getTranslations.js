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
                    let htmlContent = '<div class="row col-12 p-3">'; // Make the container
                    // Loop through each translation in the response
                    response.forEach(function(translation) {
                        // Add each translation to the list
                        console.log(translation);
                        htmlContent += `
                            <div class="row col-12 p-3" id="row-${translation.id}">
                                <div class="col-10">
                                    <strong>ID:</strong> ${translation.id}<br>
                                    <strong>Date added:</strong> ${translation.date_added}<br>
                                    <strong>Direction:</strong> ${translation.direction}<br>
                                    <strong>Text:</strong> ${translation.text}<br>
                                    <strong class="${translation.preferred_translation === 1 || translation.preferred_translation === 3? 'text-success' : 'text-danger'}">
                                        Translation 1 (Google Translate):</strong> ${translation.translation1_googleTranslate}<br>
                                    <strong class="${translation.preferred_translation === 2 || translation.preferred_translation === 3? 'text-success' : 'text-danger'}">
                                        Translation 2 (ChatGPT):</strong> ${translation.translation2_chatGPT}<br>
                                    <strong>Preferred Translation:</strong> ${translation.preferred_translation}<br>
                                </div>
                                <div class="col-2">
                                    <button class="btn"><i class="bi bi-trash fs-2 delete-button" data-id="${translation.id}"></i></button>
                                    <button class="btn btn-primary confirm-delete d-none" data-id="${translation.id}">Confirm Delete?</button>
                                </div>
                            </div>
                            <hr>
                        `;
                    });
                    htmlContent += '</div>'; // Close the list
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
    // Event delegation for dynamically added .delete-button elements
    $('#translations-container').on('click', '.delete-button', function() {
        const translationId = $(this).data('id'); // Get the data-id attribute
        console.log("Delete clicked for ID:", translationId);

        // Show the corresponding confirm-delete button
        $(`.confirm-delete[data-id="${translationId}"]`).removeClass('d-none');
    });
    // Event delegation for dynamically added .confirm-delete elements
    $('#translations-container').on('click', '.confirm-delete', function() {
        const translationId = $(this).data('id'); // Get the data-id attribute
        console.log("Confirm Delete clicked for ID:", translationId);

        // Perform deletion logic here
        // e.g., make an AJAX request to delete the entry
        $.ajax({
            url: `/deleteTranslation/${translationId}`,  // URL with the ID in the path
            method: 'DELETE',
            success: function(response) {
                console.log(response.message);
                // Update UI, remove item, etc.
                const rowId = `row-${translationId}`; // For example, row-123
                const rowElement = document.getElementById(rowId); // Select the row by its id
                $(rowElement).html('<p>Translation ' + translationId + ' was successfully deleted.</p>'); // Concatenation
            },
            error: function(xhr, status, error) {
                console.error('Error deleting translation:', error);
                alert('Error deleting translation.');
            }
        });
    });
});