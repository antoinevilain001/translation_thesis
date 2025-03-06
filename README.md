# api_access
This project connects to both a Google Translate and ChatGPT in order to translate between them, and stores the user's preferred translation.

### Windows Setup
```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
deactivate
```

### Public database
obtained from https://www.kaggle.com/datasets/lonnieqin/englishspanish-translation-dataset?resource=download

### COMET evaluator
https://github.com/Unbabel/COMET
- Unbabel/XCOMET-XL supposedly has better error analysis than Unbabel/wmt20-comet-qe-da
    - better as defined by being able to export a list of the errors found
- also some ways to analyze directly from the command line
    - comet-score -s src.txt -t hyp1.txt -r ref.txt
    - comet-score -s src.txt -t hyp1.txt -r ref.txt --model Unbabel/XCOMET-XL --to_json output.json
    - comet-score -s src.txt -t hyp1.txt --model Unbabel/wmt22-cometkiwi-da
        - this last one promises a reference-free evaluation, will need to explore further to see if this works
    - comet-compare -s src.de -t hyp1.en hyp2.en hyp3.en -r ref.en
        - used to get statistical significance between two machine learning systems
        - this is the recommended method instead of computing the scores separately

### BLEU evaluator


### Useful Git Commands
- git add -A . 
    - use the -A to track file movement from folder to folder
- git reset
    - use to undo git add