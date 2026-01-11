/**
 * Audio utility functions
 */

/**
 * Convert audio buffer to base64
 */
export const audioBufferToBase64 = (audioBuffer) => {
  // Convert Float32Array to Int16Array
  const int16Array = new Int16Array(audioBuffer.length)
  for (let i = 0; i < audioBuffer.length; i++) {
    const s = Math.max(-1, Math.min(1, audioBuffer[i]))
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  
  // Convert to base64
  const uint8Array = new Uint8Array(int16Array.buffer)
  let binaryString = ''
  const len = uint8Array.length
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(uint8Array[i])
  }
  return btoa(binaryString)
}

/**
 * Normalize frequency data
 */
export const normalizeFrequencyData = (dataArray) => {
  return Array.from(dataArray).map(value => value / 255)
}

/**
 * Calculate average volume
 */
export const calculateAverageVolume = (dataArray) => {
  return dataArray.reduce((a, b) => a + b, 0) / dataArray.length
}

/**
 * Calculate noise level from low frequencies
 */
export const calculateNoiseLevel = (dataArray, lowFreqCount = 20) => {
  const lowFreqSum = Array.from(dataArray.slice(0, lowFreqCount)).reduce((a, b) => a + b, 0)
  return lowFreqSum / lowFreqCount
}

/**
 * Detect ambient noise to verify microphone is active (not muted)
 * Even very small amounts of noise indicate the mic is active and not muted
 */
export const detectAmbientNoise = (dataArray, thresholds) => {
  // Calculate overall average noise level
  const avgLevel = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
  
  // Calculate variance - ambient noise should have some variance
  const variance = dataArray.reduce((acc, val) => {
    const diff = val - avgLevel
    return acc + (diff * diff)
  }, 0) / dataArray.length
  
  // Even very small noise indicates mic is active (not muted)
  // If there's ANY measurable signal above the muted threshold, mic is active
  const hasAmbientNoise = avgLevel >= thresholds.MUTED_THRESHOLD && 
                          avgLevel <= thresholds.AMBIENT_NOISE_MAX
  
  // Mic is muted only if signal is extremely low or zero (below muted threshold)
  const isMuted = avgLevel < thresholds.MUTED_THRESHOLD
  
  return {
    hasAmbientNoise,
    isMuted,
    ambientLevel: avgLevel,
    variance
  }
}
