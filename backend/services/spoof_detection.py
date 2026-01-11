import numpy as np
from audio.preprocess import extract_features, calculate_snr, detect_silence

class SpoofDetector:
    """Detect audio spoofing and manipulation"""
    
    def __init__(self):
        # Thresholds for detection (calibrated values)
        self.min_snr_threshold = 15  # dB
        self.max_energy_variance = 0.5
        self.min_spectral_centroid = 500  # Hz
    
    def detect(self, audio_array, sample_rate=16000):
        """
        Detect if audio is spoofed or manipulated
        
        Returns:
            float: Spoof score (0-1, where 1 indicates high spoofing likelihood)
        """
        try:
            spoof_indicators = []
            
            # Check 1: Signal-to-Noise Ratio
            snr = calculate_snr(audio_array)
            if snr < self.min_snr_threshold:
                spoof_indicators.append(0.3)  # Low SNR might indicate playback
            
            # Check 2: Energy consistency
            rms = np.abs(audio_array)
            energy_variance = np.var(rms) / (np.mean(rms) + 1e-8)
            if energy_variance < 0.01:  # Very consistent energy (suspicious)
                spoof_indicators.append(0.4)
            
            # Check 3: Spectral characteristics
            import librosa
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_array, sr=sample_rate)[0]
            if np.mean(spectral_centroid) < self.min_spectral_centroid:
                spoof_indicators.append(0.2)
            
            # Check 4: Frequency response (check for typical playback artifacts)
            fft = np.fft.fft(audio_array)
            magnitude = np.abs(fft)
            # Very flat frequency response might indicate playback
            freq_variance = np.var(magnitude[:len(magnitude)//2])
            if freq_variance < np.percentile(magnitude[:len(magnitude)//2], 50):
                spoof_indicators.append(0.2)
            
            # Check 5: Silence detection
            if detect_silence(audio_array):
                spoof_indicators.append(0.5)
            
            # Calculate final spoof score
            spoof_score = min(sum(spoof_indicators), 1.0) if spoof_indicators else 0.0
            
            return float(spoof_score)
            
        except Exception as e:
            print(f"Spoof detection error: {e}")
            return 0.5  # Neutral score on error
    
    def detect_playback(self, audio_array, sample_rate=16000):
        """Specifically detect if audio is being played back"""
        # Check for consistent energy patterns
        window_size = sample_rate // 10  # 100ms windows
        windows = []
        for i in range(0, len(audio_array) - window_size, window_size):
            window = audio_array[i:i+window_size]
            windows.append(np.mean(np.abs(window)))
        
        # Playback often has very consistent energy
        if len(windows) > 1:
            energy_variance = np.var(windows)
            if energy_variance < 0.001:
                return True
        
        return False
    
    def detect_muted_mic(self, audio_array):
        """Detect if microphone is muted or very quiet"""
        rms = np.mean(np.abs(audio_array))
        return rms < 0.001
    
    def detect_ambient_noise(self, audio_array, muted_threshold=0.0003):
        """
        Detect ambient noise to verify microphone is active (not muted)
        Even very small amounts of noise indicate the mic is active
        
        Args:
            audio_array: Audio signal
            muted_threshold: Below this level, mic is considered muted (very low/no signal)
        
        Returns:
            dict: {
                'has_ambient_noise': bool,
                'is_muted': bool,
                'ambient_level': float,
                'variance': float
            }
        """
        rms = np.mean(np.abs(audio_array))
        variance = np.var(audio_array)
        
        # Even very small noise (above muted threshold) indicates mic is active
        # If there's ANY measurable signal above the muted threshold, mic is active
        has_ambient = rms >= muted_threshold
        
        # Mic is muted only if signal is extremely low or zero (below muted threshold)
        is_muted = rms < muted_threshold
        
        return {
            'has_ambient_noise': has_ambient,
            'is_muted': is_muted,
            'ambient_level': float(rms),
            'variance': float(variance)
        }
