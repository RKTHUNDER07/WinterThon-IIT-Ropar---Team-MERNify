import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for managing microphone access
 */
export const useMicrophone = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const streamRef = useRef(null)

  const startMicrophone = useCallback(async (constraints = {}) => {
    try {
      const defaultConstraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          ...constraints.audio
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints)
      streamRef.current = stream
      setIsRecording(true)
      setError(null)
      return stream
    } catch (err) {
      setError(err.message)
      setIsRecording(false)
      throw err
    }
  }, [])

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    error,
    startMicrophone,
    stopMicrophone,
    stream: streamRef.current
  }
}
