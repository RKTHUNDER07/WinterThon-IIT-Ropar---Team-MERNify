from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from api.routes import api_bp
from api.websocket import init_websocket_handlers
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

# Initialize WebSocket handlers
init_websocket_handlers(socketio)

@app.route('/')
def health_check():
    from flask import jsonify
    return jsonify({'status': 'ok', 'message': 'VoiceShield API is running'})

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data/enrolled_embeddings', exist_ok=True)
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
