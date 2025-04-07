# translation_thesis
This project implements a translation app which connects to Google Translate, ChatGPT, and DeepL. The app allows the user to input a text to translate and provide one result for each of the translators. The user can then store a preferred translation.

This project also performs an analysis on data which has been collected using the above method.

### Overview of Repository Directory Structure
- data_collection_app/
    - implements a translation app which connects only to Google Translate and ChatGPT 4o-mini, and only allows the storage of a binary correct / incorrect preferred translation
- my_solution_app/
    - implements a translation app which connects to Google Translate, ChatGPT 4o, ChatGPT 4o-mini, and DeepL. It is designed for the storage of a 1-5 rating input for each translator.
- translation_analysis/
    - analysis1/
        - /analysis1.ipynb
            - performs the quantitative analysis of the binary data_collection_app data
        - /analysis2.ipynb
            - performs the quantitative analysis of the numerical my_solution_app data
    - comet_examples/
        - some simple examples of using the COMET evaluator, used just for reference.
    - public_database/
        - stores a public translation database used for one or more of the analysis. The citation is in /readme.md

### Windows Setup
```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m ipykernel install --user --name=venv --display-name "Python (venv)"
deactivate
```

### App Setup
- requires having a .env file in the directory with the following:
    - OPENAI_API_KEY
    - GOOGLE_API_KEY
    - DEEPL_API_KEY
    - HUGGINGFACE_TOKEN not required since model is not being run in real time
```
cd my_solution_app
create_db.py
```

### Public database
obtained from https://www.kaggle.com/datasets/lonnieqin/englishspanish-translation-dataset?resource=download

### COMET evaluator
https://github.com/Unbabel/COMET
- Unbabel/XCOMET-XL supposedly has better error analysis than Unbabel/wmt20-comet-qe-da
    - better as defined by being able to export a list of the errors found
- also some ways to analyze directly from the command line (does still appear to take a few minutes to run)
    - comet-score -s src.txt -t hyp1.txt -r ref.txt
    - comet-score -s src.txt -t hyp1.txt -r ref.txt --model Unbabel/XCOMET-XL --to_json output.json
    - comet-score -s src.txt -t hyp1.txt --model Unbabel/wmt22-cometkiwi-da
        - this last one promises a reference-free evaluation, will need to explore further to see if this works
        - this is openly accessible but seems to require a sign-up with huggingface to accept the terms and conditions
    - comet-compare -s src.de -t hyp1.en hyp2.en hyp3.en -r ref.en
        - used to get statistical significance between two machine learning systems
        - this is the recommended method instead of computing the scores separately

### BLEU evaluator


### Useful Git Commands
- git add -A . 
    - use the -A to track file movement from folder to folder
- git reset
    - use to undo git add