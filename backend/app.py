# from flask import Flask, request, jsonify
# import pickle
# import json
# import nltk
# from nltk.stem import PorterStemmer

# app = Flask(__name__)

# # Load model and vectorizer
# model = pickle.load(open("model.pkl", "rb"))
# vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
# intents = json.load(open("intents.json"))

# stemmer = PorterStemmer()

# def clean_text(text):
#     tokens = text.lower().split()
#     return " ".join([stemmer.stem(w) for w in tokens])

# def get_response(user_input):
#     cleaned = clean_text(user_input)
#     X = vectorizer.transform([cleaned])
#     prediction = model.predict(X)[0]

#     for intent in intents["intents"]:
#         if intent["tag"] == prediction:
#             return intent["responses"][0]

#     return "Sorry, I don't understand that."

# @app.route("/chat", methods=["POST"])
# def chat():
#     user_input = request.json.get("message", "")
#     reply = get_response(user_input)
#     return jsonify({"reply": reply})

# if __name__ == "__main__":
#     app.run(debug=True)


from flask import Flask, request, jsonify
# import pickle
# import json
# import nltk
from flask_cors import CORS
# from nltk.stem import PorterStemmer
from chatbot import get_response


app = Flask(__name__)
CORS(app)

# # Load model and vectorizer
# model = pickle.load(open("model.pkl", "rb"))
# vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
# intents = json.load(open("intents.json"))

# stemmer = PorterStemmer()

# def clean_text(text):
#     tokens = text.lower().split()
#     return " ".join([stemmer.stem(w) for w in tokens])

# def get_response(user_input):
#     cleaned = clean_text(user_input)
#     X = vectorizer.transform([cleaned])
#     prediction = model.predict(X)[0]

#     for intent in intents["intents"]:
#         if intent["tag"] == prediction:
#             return intent["responses"][0]

#     return "Sorry, I don't understand that."

# @app.route("/chat", methods=["POST"])
# def chat():
#     user_input = request.json.get("message", "")
#     reply = get_response(user_input)
#     return jsonify({"reply": reply})

# if __name__ == "__main__":
#     app.run(debug=True)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    reply = get_response(message)
    if isinstance(reply, dict) and reply.get("type") == "table":
        return jsonify(reply)
    return jsonify({"reply": reply if isinstance(reply, str) else reply.get("reply", "")})

if __name__ == "__main__":
    app.run(debug=True)
