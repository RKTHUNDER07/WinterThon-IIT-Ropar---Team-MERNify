import numpy as np
import librosa

def preprocess_audio(audio_array, sample_rate=16000, target_length=3.0):
    """
    Preprocess audio for analysis
    
    Args:
        audio_array: Raw audio signal
        sample_rate: Sample rate of audio
        target_length: Target length in seconds
    
    Returns:
        Preprocessed audio array
    """
    # Resample to 16kHz if needed
    if sample_rate != 16000:
        audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
        sample_rate = 16000
    
    # Normalize audio
    audio_array = librosa.util.normalize(audio_array)
    
    # Trim silence
    audio_array, _ = librosa.effects.trim(audio_array, top_db=20)
    
    # Pad or trim to target length
    target_samples = int(target_length * sample_rate)
    if len(audio_array) > target_samples:
        audio_array = audio_array[:target_samples]
    elif len(audio_array) < target_samples:
        padding = target_samples - len(audio_array)
        audio_array = np.pad(audio_array, (0, padding), mode='constant')
    
    return audio_array

def extract_features(audio_array, sample_rate=16000):
    """
    Extract audio features for analysis
    
    Returns:
        Dictionary of features
    """
    features = {}
    
    # MFCC features
    mfccs = librosa.feature.mfcc(y=audio_array, sr=sample_rate, n_mfcc=13)
    features['mfcc_mean'] = np.mean(mfccs, axis=1)
    features['mfcc_std'] = np.std(mfccs, axis=1)
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=audio_array, sr=sample_rate)[0]
    features['spectral_centroid_mean'] = np.mean(spectral_centroids)
    features['spectral_centroid_std'] = np.std(spectral_centroids)
    
    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(audio_array)[0]
    features['zcr_mean'] = np.mean(zcr)
    features['zcr_std'] = np.std(zcr)
    
    # Chroma features
    chroma = librosa.feature.chroma_stft(y=audio_array, sr=sample_rate)
    features['chroma_mean'] = np.mean(chroma, axis=1)
    
    # Energy
    rms = librosa.feature.rms(y=audio_array)[0]
    features['rms_mean'] = np.mean(rms)
    features['rms_std'] = np.std(rms)
    
    return features

def detect_silence(audio_array, threshold=0.01):
    """Detect if audio is mostly silent"""
    rms = librosa.feature.rms(y=audio_array)[0]
    return np.mean(rms) < threshold

def calculate_snr(audio_array):
    """Calculate signal-to-noise ratio"""
    signal_power = np.mean(audio_array ** 2)
    noise_estimate = np.percentile(audio_array ** 2, 10)  # Estimate noise from quiet parts
    if noise_estimate > 0:
        snr = 10 * np.log10(signal_power / noise_estimate)
    else:
        snr = 100  # Very high SNR if no noise detected
    return snr
