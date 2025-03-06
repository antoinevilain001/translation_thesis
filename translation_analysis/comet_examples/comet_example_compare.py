from comet import download_model, load_from_checkpoint
import scipy.stats as stats
import numpy as np

# Load model
model_path = download_model("Unbabel/wmt20-comet-da")
print(model_path) # will use to try and load the same from the same cache spot later instead of downloading each time
model = load_from_checkpoint(model_path)

# Example data (3 hypotheses)
data = [
    {"src": "Das ist ein Test.", "mt": "This is a test.", "ref": "This is a trial."},
    {"src": "Das ist ein Test.", "mt": "This is a sample.", "ref": "This is a trial."},
    {"src": "Das ist ein Test.", "mt": "It is a test.", "ref": "This is a trial."},
]

# Compute COMET scores
scores = model.predict(data, batch_size=8)["scores"]
print("COMET Scores:", scores)

# Perform paired t-tests to compare hypotheses
p_value_12 = stats.ttest_rel(scores[:2], scores[1:])  # Compare hyp1 vs hyp2
p_value_13 = stats.ttest_rel(scores[:1], scores[2:])  # Compare hyp1 vs hyp3

alpha = 0.05  # Significance level

def compare(p_value):
    return "Significant difference" if p_value < alpha else "Statistical tie"

print("Hyp1 vs Hyp2:", compare(p_value_12.pvalue))
print("Hyp1 vs Hyp3:", compare(p_value_13.pvalue))
