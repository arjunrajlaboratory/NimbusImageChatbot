from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
import logging
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": "*"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Anthropic client
anthropic = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

# Load system prompt
with open("system_prompt_1.txt", "r") as f:
    system_prompt = f.read().strip()

@app.route('/')
def home():
    return "Flask server is running!"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        logger.debug(f"Received data: {data}")
        
        messages = data.get('messages', [])
        
        logger.debug(f"Processing {len(messages)} messages")

        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000,
            temperature=0,
            system=system_prompt,
            messages=messages
        )
        
        logger.debug(f"Received response from Anthropic API: {response.content[0].text[:100]}...")
        return jsonify({'response': response.content[0].text})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
