import numpy as np
import uuid
import time
from audio.preprocess import calculate_snr, extract_features
from services.spoof_detection import SpoofDetector

class RiskEngine:
    """Risk assessment engine for audio validation"""
    
    def __init__(self):
        self.spoof_detector = SpoofDetector()
        self.sessions = {}  # In-memory session storage
        
        # Quality thresholds
        self.min_snr = 10  # dB
        self.min_energy = 0.01
        self.max_spoof_score = 0.6
    
    def create_session(self, user_id):
        """Create a new examination session"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            'user_id': user_id,
            'created_at': time.time(),
            'audio_chunks': [],
            'risk_history': [],
            'quality_history': [],
            'spoof_history': []
        }
        return session_id
    
    def calculate_quality_score(self, audio_array, sample_rate=16000):
        """
        Calculate audio quality score (0-1)
        
        Returns:
            float: Quality score where 1 is excellent quality
        """
        try:
            scores = []
            
            # SNR score
            snr = calculate_snr(audio_array)
            snr_score = min(snr / 30.0, 1.0)  # Normalize to 0-1
            scores.append(snr_score * 0.3)
            
            # Energy score
            energy = np.mean(np.abs(audio_array))
            energy_score = min(energy / 0.1, 1.0)
            scores.append(energy_score * 0.3)
            
            # Frequency content score
            import librosa
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_array, sr=sample_rate)[0]
            freq_score = min(np.mean(spectral_centroid) / 3000, 1.0)
            scores.append(freq_score * 0.2)
            
            # Consistency score
            rms = librosa.feature.rms(y=audio_array)[0]
            consistency = 1.0 - min(np.std(rms) / (np.mean(rms) + 1e-8), 1.0)
            scores.append(consistency * 0.2)
            
            quality_score = sum(scores)
            return float(max(0.0, min(1.0, quality_score)))
            
        except Exception as e:
            print(f"Quality calculation error: {e}")
            return 0.5
    
    def calculate_risk(self, audio_array):
        """
        Calculate overall risk level
        
        Returns:
            dict: Risk assessment with level and details
        """
        try:
            quality_score = self.calculate_quality_score(audio_array)
            spoof_score = self.spoof_detector.detect(audio_array)
            
            # Calculate risk level
            risk_factors = []
            
            if quality_score < 0.3:
                risk_factors.append('low_quality')
            if spoof_score > self.max_spoof_score:
                risk_factors.append('spoof_detected')
            if self.spoof_detector.detect_playback(audio_array):
                risk_factors.append('playback_detected')
            if self.spoof_detector.detect_muted_mic(audio_array):
                risk_factors.append('muted_mic')
            
            # Check ambient noise
            ambient_result = self.spoof_detector.detect_ambient_noise(audio_array)
            if ambient_result['is_muted']:
                risk_factors.append('muted_mic')
            
            # Determine risk level
            if len(risk_factors) >= 2:
                risk_level = 'high'
            elif len(risk_factors) == 1:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'level': risk_level,
                'factors': risk_factors,
                'quality_score': quality_score,
                'spoof_score': spoof_score
            }
            
        except Exception as e:
            print(f"Risk calculation error: {e}")
            return {
                'level': 'unknown',
                'factors': [],
                'quality_score': 0.5,
                'spoof_score': 0.5
            }
    
    def get_recommendations(self, audio_array):
        """Get recommendations based on audio analysis"""
        risk = self.calculate_risk(audio_array)
        recommendations = []
        
        if risk['quality_score'] < 0.3:
            recommendations.append('Audio quality is poor. Please check your microphone and connection.')
        
        if risk['spoof_score'] > self.max_spoof_score:
            recommendations.append('Suspicious audio patterns detected. Please ensure you are speaking directly into the microphone.')
        
        if 'playback_detected' in risk['factors']:
            recommendations.append('Playback detected. Please speak naturally without using pre-recorded audio.')
        
        if 'muted_mic' in risk['factors']:
            recommendations.append('Microphone appears muted or too quiet. Please unmute and speak clearly.')
        
        if not recommendations:
            recommendations.append('Audio quality is good. Continue speaking.')
        
        return recommendations
    
    def get_session_status(self, session_id):
        """Get current status of a session"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        
        # Calculate aggregate statistics
        if session['risk_history']:
            avg_risk = np.mean([r['spoof_score'] for r in session['risk_history']])
            avg_quality = np.mean(session['quality_history'])
        else:
            avg_risk = 0.0
            avg_quality = 1.0
        
        return {
            'session_id': session_id,
            'user_id': session['user_id'],
            'duration': time.time() - session['created_at'],
            'chunks_processed': len(session['audio_chunks']),
            'average_quality': float(avg_quality),
            'average_spoof_score': float(avg_risk),
            'status': 'active'
        }
