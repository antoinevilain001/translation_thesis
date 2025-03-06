print("Beginning of script. Importing.")
import time
start_time = time.time()
from comet import download_model, load_from_checkpoint # takes 5-10 seconds just to import

print("Done importing. Downloading model.")
cur_time = time.time()
elapsed_time = cur_time - start_time
print(f"Execution Time: {elapsed_time:.5f} seconds") # I got 32s
# Choose your model from Hugging Face Hub
# model_path = download_model("Unbabel/XCOMET-XL")
# or for example:
model_path = download_model("Unbabel/wmt22-comet-da") # 2.32G download. Takes a few minutes.

# Load the model checkpoint:
model = load_from_checkpoint(model_path) # Takes a couple minutes
print("Model downloaded. Beginning analysis.")
cur_time = time.time()
elapsed_time = cur_time - start_time
print(f"Execution Time: {elapsed_time:.5f} seconds") # The second time running I got 92s

# Data must be in the following format:
data = [
    {
        "src": "10 到 15 分钟可以送到吗",
        "mt": "Can I receive my food in 10 to 15 minutes?",
        "ref": "Can it be delivered between 10 to 15 minutes?"
    },
    {
        "src": "Pode ser entregue dentro de 10 a 15 minutos?",
        "mt": "Can you send it for 10 to 15 minutes?",
        "ref": "Can it be delivered between 10 to 15 minutes?"
    }
]
# Call predict method:
model_output = model.predict(data, batch_size=8, gpus=0) # quite rapid


# Sentence-level scores (list)
print(model_output.scores)
'''
[0.9822099208831787, 0.9599897861480713]
# I got [0.8417138457298279, 0.7745394110679626]
'''

# System-level score (float)
print(model_output.system_score)
'''
0.971099853515625
# I got 0.8081266283988953
'''

cur_time = time.time()
elapsed_time = cur_time - start_time
print(f"Execution Time: {elapsed_time:.5f} seconds")

# Detected error spans (list of list of dicts)
print(model_output.metadata.error_spans)
'''
[
  [{'confidence': 0.4160953164100647,
   'end': 21,
   'severity': 'minor',
   'start': 13,
   'text': 'my food'}],
  [{'confidence': 0.40004390478134155,
   'end': 19,
   'severity': 'minor',
   'start': 3,
   'text': 'you send it for'}]
]
# I got that model_output has no attribute metadata, perhaps that is only available with the XL?
>>> model_output
Prediction([('scores', [0.8417138457298279, 0.7745394110679626]), ('system_score', 0.8081266283988953)])
'''