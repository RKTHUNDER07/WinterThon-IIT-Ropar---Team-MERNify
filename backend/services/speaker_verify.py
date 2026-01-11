import numpy as np
import os
import json
import pickle
from models.ecapa import ECAPA_TDNN
from audio.feature_extract import extract_embeddings, calculate_similarity

class SpeakerVerifier:
    """Speaker verification service using ECAPA-TDNN embeddings"""
    
    def __init__(self):
        self.model = ECAPA_TDNN()
        self.embeddings_dir = 'data/enrolled_embeddings'
        os.makedirs(self.embeddings_dir, exist_ok=True)
        self.model.load_model()
    
    def enroll_speaker(self, user_id, audio_array, sample_rate=16000):
        """
        Enroll a speaker by storing their voice embedding
        
        Args:
            user_id: Unique user identifier
            audio_array: Audio signal
            sample_rate: Sample rate
        
        Returns:
            bool: Success status
        """
        try:
            # Extract embedding
            embedding = self.model.extract_embedding(audio_array, sample_rate)
            
            # Store embedding
            embedding_path = os.path.join(self.embeddings_dir, f'{user_id}.npy')
            np.save(embedding_path, embedding)
            
            # Also store metadata
            metadata_path = os.path.join(self.embeddings_dir, f'{user_id}_meta.json')
            metadata = {
                'user_id': user_id,
                'embedding_shape': embedding.shape,
                'sample_rate': sample_rate
            }
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f)
            
            return True
        except Exception as e:
            print(f"Enrollment error: {e}")
            return False
    
    def verify_speaker(self, user_id, audio_array, sample_rate=16000, threshold=0.7):
        """
        Verify if audio matches enrolled speaker
        
        Args:
            user_id: User identifier
            audio_array: Audio signal to verify
            sample_rate: Sample rate
            threshold: Similarity threshold for verification
        
        Returns:
            dict: Verification result with verified status, confidence, and similarity
        """
        try:
            # Load enrolled embedding
            embedding_path = os.path.join(self.embeddings_dir, f'{user_id}.npy')
            
            if not os.path.exists(embedding_path):
                return {
                    'verified': False,
                    'confidence': 0.0,
                    'similarity': 0.0,
                    'message': 'Speaker not enrolled'
                }
            
            enrolled_embedding = np.load(embedding_path)
            
            # Extract embedding from current audio
            current_embedding = self.model.extract_embedding(audio_array, sample_rate)
            
            # Calculate similarity
            similarity = self.model.compute_similarity(enrolled_embedding, current_embedding)
            
            # Verify
            verified = similarity >= threshold
            confidence = similarity
            
            return {
                'verified': verified,
                'confidence': float(confidence),
                'similarity': float(similarity),
                'threshold': threshold
            }
            
        except Exception as e:
            print(f"Verification error: {e}")
            return {
                'verified': False,
                'confidence': 0.0,
                'similarity': 0.0,
                'error': str(e)
            }
