from flask import Flask, render_template, request, jsonify, send_file
from openai import OpenAI
import os
import requests
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
import csv # for database export
from dotenv import load_dotenv
import deepl

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

from sqlalchemy.sql import func

class translation(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    direction = db.Column(db.String(10), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(500), nullable=False)

    # Translation fields
    translation1_googleTranslate = db.Column(db.String(500), nullable=False)
    rating1_googleTranslate = db.Column(db.Integer, nullable=True)
    
    translation2_chatGPT = db.Column(db.String(500), nullable=False)
    rating2_chatGPT = db.Column(db.Integer, nullable=True)
    
    translation3_chatGPTmini = db.Column(db.String(500), nullable=False)
    rating3_chatGPTmini = db.Column(db.Integer, nullable=True)
    
    translation4_deepL = db.Column(db.String(500), nullable=False)
    rating4_deepL = db.Column(db.Integer, nullable=True)

    # Timestamp
    date_added = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<Translation {self.text}>'
    
    # Serialize method
    def serialize(self):
        return {
            'id': self.id,
            'direction': self.direction,
            'category': self.category,
            'text': self.text,
            'translation1_googleTranslate': self.translation1_googleTranslate,
            'rating1_googleTranslate': self.rating1_googleTranslate,
            'translation2_chatGPT': self.translation2_chatGPT,
            'rating2_chatGPT': self.rating2_chatGPT,
            'translation3_chatGPTmini': self.translation3_chatGPTmini,
            'rating3_chatGPTmini': self.rating3_chatGPTmini,
            'translation4_deepL': self.translation4_deepL,
            'rating4_deepL': self.rating4_deepL,
            'date_added': self.date_added,
        }
    
with app.app_context():
    db.create_all()  # Creates the tables based on the models

# Load environment variables from .env file
load_dotenv()

# Set your OpenAI API key
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),  # Now loaded from .env
)

# Load your Google Cloud API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")
print(GOOGLE_API_KEY)
print(DEEPL_API_KEY)
translator = deepl.Translator(DEEPL_API_KEY)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/chatGPT')
def template_chatGPT():
    return render_template('ask-chatGPT.html')

@app.route('/googleTranslate')
def template_googleTranslate():
    return render_template('ask-googleTranslate.html')

@app.route('/deepL')
def template_deepL():
    return render_template('ask-deepL.html')


@app.route('/export_translations')
def export_csv():
    table_name = "translation"
    output_csv_path = os.path.join('instance', f'{table_name}.csv')

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)

    # Use the model class directly
    rows = translation.query.all()  # Query all rows from the translation table
    columns = [column.name for column in translation.__table__.columns]  # Get column names

    # Write to CSV
    with open(output_csv_path, mode='w', newline='', encoding='utf-8-sig') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(columns)
        writer.writerows([tuple(getattr(row, col) for col in columns) for row in rows])

    # Return the CSV as a downloadable file
    return send_file(output_csv_path, as_attachment=True)


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

@app.route('/deleteTranslation/<int:id>', methods=['DELETE'])
def delete_translation(id):
    # Query the translation by the given ID
    translation_to_delete = translation.query.get(id)

    if not translation_to_delete:
        return jsonify({"error": "Translation not found"}), 404

    # Delete the translation entry
    db.session.delete(translation_to_delete)
    db.session.commit()

    return jsonify({"message": "Translation successfully deleted"}), 200

# Define a route for creating new translations
@app.route('/addToDB', methods=['POST'])
def create_translation():
    try:
        # Extract data from request form
        user_input = request.form["prompt"]
        the_direction = request.form["option"]
        category = request.form["category"]
        googleTranslate_translation = request.form["googleTranslate_translation"]
        googleTranslate_rating = int(request.form["googleTranslate_rating"])
        chatGPT_translation = request.form["chatGPT_translation"]
        chatGPT_rating = int(request.form["chatGPT_rating"])
        chatGPTmini_translation = request.form["chatGPTmini_translation"]
        chatGPTmini_rating = int(request.form["chatGPTmini_rating"])
        deepL_translation = request.form["deepL_translation"]
        deepL_rating = int(request.form["deepL_rating"])

        # Create a new translation object
        new_translation = translation(
            text=user_input,
            direction=the_direction,
            category=category,
            translation1_googleTranslate=googleTranslate_translation,
            rating1_googleTranslate=googleTranslate_rating,
            translation2_chatGPT=chatGPT_translation,
            rating2_chatGPT=chatGPT_rating,
            translation3_chatGPTmini=chatGPTmini_translation,
            rating3_chatGPTmini=chatGPTmini_rating,
            translation4_deepL=deepL_translation,
            rating4_deepL=deepL_rating
        )

        # Add to database and commit
        db.session.add(new_translation)
        db.session.commit()

        return jsonify({'message': 'Translation added successfully', 'translation': new_translation.serialize()}), 201

    except Exception as e:
        db.session.rollback()
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
    elif (language_input == "fre_to_eng"):
        source_language_selector = "French"
        target_language_selector = "English"
    elif (language_input == "eng_to_fre"):
        source_language_selector = "English"
        target_language_selector = "French"
    
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
    elif (language_input == "fre_to_eng"):
        language_selector = "French to English"
    elif (language_input == "eng_to_fre"):
        language_selector = "English to French"
    
    my_model = request.form['model']

    try:
        # Use the OpenAI API to get a response from ChatGPT
        completion = client.chat.completions.create(
            model=my_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Please translate the following text from "+language_selector+". Include the translation and nothing else."
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

@app.route('/askDeepL', methods=['POST'])
def askDeepL():
    text = request.form['prompt']
    language_input = request.form['option']
    source_language = ''
    target_language = ''
    if (language_input == "eng_to_spa"):
        source_language = "EN"
        target_language = "ES"
    elif (language_input == "spa_to_eng"):
        source_language = "ES"
        target_language = "EN-US"
    elif (language_input == "fre_to_eng"):
        source_language = "FR"
        target_language = "EN-US"
    elif (language_input == "eng_to_fre"):
        source_language = "EN"
        target_language = "FR"

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        translated_text = translator.translate_text(text, source_lang=source_language, target_lang=target_language)
        return jsonify({"translated_text": translated_text.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    elif (language_input == "fre_to_eng"):
        source_language = "fr"
        target_language = "en"
    elif (language_input == "eng_to_fre"):
        source_language = "en"
        target_language = "fr"

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
