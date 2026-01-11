import { useEffect, useRef, useState, useCallback } from 'react'
import { normalizeFrequencyData, calculateAverageVolume, calculateNoiseLevel, detectAmbientNoise } from '../utils/audioUtils'
import { AUDIO_THRESHOLDS } from '../utils/thresholds'

/**
 * Custom hook for audio analysis using Web Audio API
 */
export const useAudioAnalyser = (stream, isRecording) => {
  const [frequencyData, setFrequencyData] = useState([])
  const [averageVolume, setAverageVolume] = useState(0)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [hasStaticNoise, setHasStaticNoise] = useState(false)
  const [hasAmbientNoise, setHasAmbientNoise] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [ambientLevel, setAmbientLevel] = useState(0)
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const microphoneRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!stream || !isRecording) {
      return
    }

    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContext()
    audioContextRef.current = audioContext

    // Create analyser
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    analyserRef.current = analyser

    // Connect microphone
    const microphone = audioContext.createMediaStreamSource(stream)
    microphoneRef.current = microphone
    microphone.connect(analyser)

    // Start analysis
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const updateFrequency = () => {
      if (!analyserRef.current) return
      
      analyser.getByteFrequencyData(dataArray)
      const normalized = normalizeFrequencyData(dataArray)
      setFrequencyData(normalized)
      
      const avg = calculateAverageVolume(dataArray)
      setAverageVolume(avg)
      
      const noise = calculateNoiseLevel(dataArray)
      setNoiseLevel(noise)
      
      // Check for static noise
      if (noise > AUDIO_THRESHOLDS.MIN_NOISE_LEVEL && noise < AUDIO_THRESHOLDS.MAX_NOISE_LEVEL) {
        setHasStaticNoise(true)
      } else {
        setHasStaticNoise(false)
      }
      
      // Check for ambient noise (to verify mic is not muted)
      const ambientResult = detectAmbientNoise(dataArray, AUDIO_THRESHOLDS)
      setHasAmbientNoise(ambientResult.hasAmbientNoise)
      setIsMuted(ambientResult.isMuted)
      setAmbientLevel(ambientResult.ambientLevel)

      animationFrameRef.current = requestAnimationFrame(updateFrequency)
    }

    updateFrequency()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stream, isRecording])

  return {
    frequencyData,
    averageVolume,
    noiseLevel,
    hasStaticNoise,
    hasAmbientNoise,
    isMuted,
    ambientLevel
  }
}
