from flask import Blueprint, request, jsonify
from services.speaker_verify import SpeakerVerifier
from services.spoof_detection import SpoofDetector
from services.risk_engine import RiskEngine
import base64
import numpy as np
import io
import librosa

api_bp = Blueprint('api', __name__)

# Initialize services
speaker_verifier = SpeakerVerifier()
spoof_detector = SpoofDetector()
risk_engine = RiskEngine()

@api_bp.route('/auth/login', methods=['POST'])
def login():
    """User authentication endpoint"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Simple validation - in production, use proper authentication
    if email and password:
        return jsonify({
            'success': True,
            'token': 'demo-token',
            'user': {'email': email}
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

@api_bp.route('/audio/validate', methods=['POST'])
def validate_audio():
    """Validate audio chunk for spoofing and quality"""
    try:
        data = request.json
        audio_data = data.get('audio')
        user_id = data.get('user_id', 'default_user')
        session_id = data.get('session_id')
        
        if not audio_data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data)
        
        # Convert to numpy array (assuming 16-bit PCM)
        audio_array = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Process audio
        results = {
            'session_id': session_id,
            'quality_score': risk_engine.calculate_quality_score(audio_array),
            'spoof_score': spoof_detector.detect(audio_array),
            'risk_level': risk_engine.calculate_risk(audio_array),
            'recommendations': risk_engine.get_recommendations(audio_array)
        }
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/audio/enroll', methods=['POST'])
def enroll_speaker():
    """Enroll a speaker's voice for verification"""
    try:
        data = request.json
        audio_data = data.get('audio')
        user_id = data.get('user_id')
        
        if not audio_data or not user_id:
            return jsonify({'error': 'Missing audio or user_id'}), 400
        
        # Decode and process
        audio_bytes = base64.b64decode(audio_data)
        audio_array = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Enroll speaker
        success = speaker_verifier.enroll_speaker(user_id, audio_array)
        
        if success:
            return jsonify({'success': True, 'message': 'Speaker enrolled successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Enrollment failed'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/audio/verify', methods=['POST'])
def verify_speaker():
    """Verify if audio matches enrolled speaker"""
    try:
        data = request.json
        audio_data = data.get('audio')
        user_id = data.get('user_id')
        
        if not audio_data or not user_id:
            return jsonify({'error': 'Missing audio or user_id'}), 400
        
        # Decode and process
        audio_bytes = base64.b64decode(audio_data)
        audio_array = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Verify speaker
        result = speaker_verifier.verify_speaker(user_id, audio_array)
        
        return jsonify({
            'verified': result['verified'],
            'confidence': result['confidence'],
            'similarity': result['similarity']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/session/start', methods=['POST'])
def start_session():
    """Start a new examination session"""
    data = request.json
    user_id = data.get('user_id')
    
    session_id = risk_engine.create_session(user_id)
    
    return jsonify({
        'session_id': session_id,
        'status': 'started'
    }), 200

@api_bp.route('/session/<session_id>/status', methods=['GET'])
def get_session_status(session_id):
    """Get current session status and risk assessment"""
    status = risk_engine.get_session_status(session_id)
    
    if status:
        return jsonify(status), 200
    else:
        return jsonify({'error': 'Session not found'}), 404
