from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
import requests
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

# Initialize SQLAlchemy
db = SQLAlchemy()

# Create the Flask app
app = Flask(__name__)

# Configure the database
app.secret_key = "hello"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the app
db.init_app(app)

class translation(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    direction = db.Column(db.String(10), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    translation1_chatGPT = db.Column(db.String(500), nullable=False)
    translation2_googleTranslate = db.Column(db.String(500), nullable=False)
    preferred_translation = db.Column(db.Integer, nullable=True)
    date_added = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<Text {self.text}>'
    
    # Serialize method
    def serialize(self):
        return {
            'id': self.id,
            'direction': self.direction,
            'text': self.text,
            'translation1_chatGPT': self.translation1_chatGPT,
            'translation2_googleTranslate': self.translation2_googleTranslate,
            'preferred_translation': self.preferred_translation,
            'date_added': self.date_added,
        }
    
with app.app_context():
    db.create_all()  # Creates the tables based on the models

# Set your OpenAI API key
client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)
# Load your Google Cloud API key from environment variables or directly set it
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Or hardcode your API key (not recommended)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/chatGPT')
def template_chatGPT():
    return render_template('ask-chatGPT.html')

@app.route('/googleTranslate')
def template_googleTranslate():
    return render_template('ask-googleTranslate.html')

@app.route('/getTranslations')
def template_get_translations():
    return render_template('getTranslations.html')


@app.route('/getTheTranslations', methods=['GET'])
def get_all_translations():
    # Query the database to get entries that match the provided direction
    translations = translation.query.order_by(translation.date_added.desc()).all()

    # Serialize the entries
    translations_list = [entry.serialize() for entry in translations]

    # Return the response as JSON
    return jsonify(translations_list)

# Define a route for creating new translations
@app.route('/addToDB', methods=['POST'])
def create_translation():
    the_direction = request.form["language_sel"]
    user_input = request.form["user_input"]
    googleTranslate = request.form["googleTranslate"]
    chatGPT = request.form["chatGPT"]
    preferred_translation = request.form["preferred_translation"]

    # Should probably insert some error handling

    # Create a new EngToSpa_translation object
    new_translation = translation(
        text=user_input,
        direction=the_direction,
        translation1_chatGPT=chatGPT,
        translation2_googleTranslate=googleTranslate,
        preferred_translation=int(preferred_translation)  # This is optional
    )

    try:
        db.session.add(new_translation)  # Add to the session
        db.session.commit()  # Commit the transaction
        return jsonify({'message': 'Translation added successfully', 'translation': new_translation.serialize()}), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({'error': str(e)}), 500


@app.route('/compareResponses', methods=['POST'])
def compareResponses():
    phrase_to_translate = request.form['phrase_to_translate']
    googleTranslate_translation = request.form['googleTranslate_translation']
    chatGPT_translation = request.form['chatGPT_translation']
    language_input = request.form['option']
    source_language_selector = ""
    target_language_selector = ""
    if (language_input == "eng_to_spa"):
        source_language_selector = "English"
        target_language_selector = "Spanish"
    elif (language_input == "spa_to_eng"):
        source_language_selector = "Spanish"
        target_language_selector = "English"
    
    try:
        # Use the OpenAI API to get a response from ChatGPT
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a helpful assistant. "
                        f"I am trying to decide between two {target_language_selector} translations "
                        f"for the following {source_language_selector} phrase: {phrase_to_translate} "
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Translation 1: {googleTranslate_translation} \n"
                        f"Translation 2: {chatGPT_translation} "
                    )
                }
            ]
        )

        # print(completion.choices[0].message)
        result = completion.choices[0].message.content  # Correctly access content
        return jsonify({"response": result})
        # return completion.choices[0]
    
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/askChatGPT', methods=['POST'])
def askChatGPT():
    user_input = request.form['prompt']
    language_input = request.form['option']
    language_selector = ""
    if (language_input == "eng_to_spa"):
        language_selector = "English to Spanish"
    elif (language_input == "spa_to_eng"):
        language_selector = "Spanish to English"
    
    try:
        # Use the OpenAI API to get a response from ChatGPT
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Please translate the following text from "+language_selector+"."
                },
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


@app.route('/askGoogleTranslate', methods=['POST'])
def askGoogleTranslate():
    user_input = request.form['text']
    language_input = request.form['option']
    text_to_translate = user_input

    # return jsonify({"response": "hi"})
    
    if not text_to_translate:
        return jsonify({"error": "This application returned an error", "details": "Text is required for translation"})
    
    source_language = ''
    target_language = ''
    if (language_input == "eng_to_spa"):
        source_language = "en"
        target_language = "es"
    elif (language_input == "spa_to_eng"):
        source_language = "es"
        target_language = "en"

    # Make the request to Google Translate API
    try:
        # Set up the URL for Google Translate API
        url = f"https://translation.googleapis.com/language/translate/v2"

        # Payload for the API request
        params = {
            'q': text_to_translate,
            'target': target_language,
            'source': source_language,
            #'key': "invalid_key"
            'key': GOOGLE_API_KEY
        }

        # Make the request to the Google Translate API
        response = requests.get(url, params=params)

        # Check if the response is successful
        if response.status_code != 200:
            print("Google Translate API has returned an error")
            #return jsonify({"error": "Translation API request failed"})
            return jsonify({"error": "The call to GoogleTranslate API returned an error", "details": str(response.json())})
        

        # Extract the translated text from the API response
        print("translated text returned: "+ str(response.json()))
        #translated_text = response.json().translations[0].translatedText
        translated_text = response.json()['data']['translations'][0]['translatedText']
        print("translated text parsed: "+ translated_text)

        # Return the translated text
        return jsonify({"translated_text": translated_text})

    except Exception as e:
        print(str(e))
        return jsonify({"error": "This application returned an exception", "details": str(e)})


### Individual ask functions ###

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
    

@app.route('/translate', methods=['POST'])
def translate():
    user_input = request.form['text']
    text_to_translate = user_input

    # return jsonify({"response": "hi"})
    
    if not text_to_translate:
        return jsonify({"error": "This application returned an error", "details": "Text is required for translation"})
    
    target_language = 'es'  # Default to Spanish

    # Make the request to Google Translate API
    try:
        # Set up the URL for Google Translate API
        url = f"https://translation.googleapis.com/language/translate/v2"

        # Payload for the API request
        params = {
            'q': text_to_translate,
            'target': target_language,
            #'key': "invalid_key"
            'key': GOOGLE_API_KEY
        }

        # Make the request to the Google Translate API
        response = requests.get(url, params=params)

        # Check if the response is successful
        if response.status_code != 200:
            print("Google Translate API has returned an error")
            #return jsonify({"error": "Translation API request failed"})
            return jsonify({"error": "The call to GoogleTranslate API returned an error", "details": str(response.json())})
        

        # Extract the translated text from the API response
        print("translated text returned: "+ str(response.json()))
        #translated_text = response.json().translations[0].translatedText
        translated_text = response.json()['data']['translations'][0]['translatedText']
        print("translated text parsed: "+ translated_text)

        # Return the translated text
        return jsonify({"translated_text": translated_text})

    except Exception as e:
        print(str(e))
        return jsonify({"error": "This application returned an exception", "details": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
