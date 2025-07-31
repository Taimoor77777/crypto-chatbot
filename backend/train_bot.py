import json
import random
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import nltk
from nltk.stem import PorterStemmer

stemmer = PorterStemmer()

with open("intents.json") as file:
    data = json.load(file)

corpus = []
tags = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        tokens = pattern.lower().split()
        stemmed = " ".join([stemmer.stem(word) for word in tokens])
        corpus.append(stemmed)
        tags.append(intent["tag"])

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)
y = tags

model = LogisticRegression()
model.fit(X, y)

# Save model and vectorizer
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("Model trained and saved.")
