from flask_socketio import emit
import base64
import numpy as np
from services.spoof_detection import SpoofDetector
from services.risk_engine import RiskEngine

spoof_detector = SpoofDetector()
risk_engine = RiskEngine()

def init_websocket_handlers(socketio):
    """Initialize WebSocket event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('connected', {'status': 'connected'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
    
    @socketio.on('audio_stream')
    def handle_audio_stream(data):
        """Handle real-time audio stream chunks"""
        try:
            audio_data = data.get('audio')
            session_id = data.get('session_id')
            user_id = data.get('user_id')
            
            if not audio_data:
                emit('error', {'message': 'No audio data'})
                return
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            audio_array = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Quick validation
            spoof_score = spoof_detector.detect(audio_array)
            quality_score = risk_engine.calculate_quality_score(audio_array)
            risk_level = risk_engine.calculate_risk(audio_array)
            
            # Emit results back to client
            emit('audio_analysis', {
                'spoof_score': spoof_score,
                'quality_score': quality_score,
                'risk_level': risk_level,
                'timestamp': data.get('timestamp')
            })
            
        except Exception as e:
            emit('error', {'message': str(e)})
