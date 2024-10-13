from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
import requests

app = Flask(__name__)

# Set your OpenAI API key
client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.form['prompt']
    
    try:
        # Use the OpenAI API to get a response from ChatGPT
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": user_input
                }
            ]
        )

        print(completion.choices[0].message)
        result = completion.choices[0].message.content  # Correctly access content
        return jsonify({"response": result})
        # return completion.choices[0]
    
    except Exception as e:
        return jsonify({"error": str(e)})
    

# Load your Google Cloud API key from environment variables or directly set it
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Or hardcode your API key (not recommended)

@app.route('/translate', methods=['POST'])
def translate():
    user_input = request.form['text']
    text_to_translate = user_input

    # return jsonify({"response": "hi"})
    
    if not text_to_translate:
        return jsonify({"error": "Text is required for translation"})
    
    target_language = 'es'  # Default to Spanish

    # Make the request to Google Translate API
    try:
        # Set up the URL for Google Translate API
        url = f"https://translation.googleapis.com/language/translate/v2"

        # Payload for the API request
        params = {
            'q': text_to_translate,
            'target': target_language,
            'key': GOOGLE_API_KEY
        }

        # Make the request to the Google Translate API
        response = requests.get(url, params=params)

        # Check if the response is successful
        if response.status_code != 200:
            print("Google Translate API has returned an error")
            #return jsonify({"error": "Translation API request failed"})
            return jsonify({"error": "Translation API request failed" + response.json()})

        # Extract the translated text from the API response
        translated_text = response.json()['data']['translations'][0]['translatedText']

        # Return the translated text
        return jsonify({"translated_text": translated_text})

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
