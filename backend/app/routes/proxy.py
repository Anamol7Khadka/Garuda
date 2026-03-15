import os
import requests
from flask import Blueprint, request, jsonify

proxy_bp = Blueprint('proxy', __name__)

AZURE_ENDPOINT = "https://nexalaris-tech.openai.azure.com/openai/deployments/gpt-5.4/chat/completions?api-version=2025-01-01-preview"
AZURE_API_KEY = os.getenv('AZURE_API_KEY')

@proxy_bp.route('/api/proxy/chat', methods=['POST'])
def proxy_chat():
    try:
        data = request.get_json()
        response = requests.post(
            AZURE_ENDPOINT,
            headers={
                'Content-Type': 'application/json',
                'api-key': AZURE_API_KEY
            },
            json=data,
            timeout=30
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500