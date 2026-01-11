import numpy as np
import librosa

def extract_mel_spectrogram(audio_array, sample_rate=16000, n_mels=64):
    """Extract mel spectrogram for deep learning models"""
    mel_spec = librosa.feature.melspectrogram(
        y=audio_array,
        sr=sample_rate,
        n_mels=n_mels,
        fmax=8000
    )
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    return mel_spec_db

def extract_embeddings(audio_array, sample_rate=16000):
    """
    Extract speaker embeddings (simplified version)
    In production, this would use a pre-trained model like ECAPA-TDNN
    """
    # This is a placeholder - would use actual embedding model
    # For now, return feature-based representation
    mfccs = librosa.feature.mfcc(y=audio_array, sr=sample_rate, n_mfcc=13)
    embedding = np.mean(mfccs, axis=1)
    
    # Normalize
    embedding = embedding / (np.linalg.norm(embedding) + 1e-8)
    
    return embedding

def calculate_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    return float(similarity)
