from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "")
        
        if not message:
            return jsonify({"type": "text", "reply": "Please enter a message."})
        
       
        response = get_response(message)
        
        if isinstance(response, dict):
            if response.get("type") == "table":
                return jsonify(response)
            elif response.get("type") == "chart":
                return jsonify(response)
            elif response.get("type") == "news":
                return jsonify(response)
            elif response.get("type") == "market_info":
                return jsonify(response)
            elif response.get("type") == "text":
                return jsonify(response)
            else:
                return jsonify(response)
        elif isinstance(response, str):
            return jsonify({"type": "text", "reply": response})
        else:
            return jsonify({"type": "text", "reply": str(response)})
            
    except Exception as e:
        print(f"Error in chat endpoint: {e}")  
        return jsonify({"type": "text", "reply": "❌ Something went wrong. Please try again."})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "message": "Crypto Chatbot API is running!"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
