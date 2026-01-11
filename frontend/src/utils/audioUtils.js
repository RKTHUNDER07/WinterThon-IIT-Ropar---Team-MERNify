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
