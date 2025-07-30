import json
import pickle
import nltk
import random
from nltk.stem import PorterStemmer

stemmer = PorterStemmer()

with open("intents.json") as file:
    intents = json.load(file)

model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def clean_text(text):
    tokens = text.lower().split()
    stemmed = " ".join([stemmer.stem(w) for w in tokens])
    return stemmed

def get_response(user_input):
    cleaned = clean_text(user_input)
    X = vectorizer.transform([cleaned])
    prediction = model.predict(X)[0]

    for intent in intents["intents"]:
        if intent["tag"] == prediction:
            return random.choice(intent["responses"])

    return "Sorry, I don't understand that. Can you rephrase?"

print("🤖 Crypto Chatbot is ready! Type 'quit' to exit.")
while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        print("Bot: Goodbye 👋")
        break
    response = get_response(user_input)
    print(f"Bot: {response}")
