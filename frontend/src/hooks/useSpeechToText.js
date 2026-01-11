import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for speech-to-text conversion
 */
export const useSpeechToText = (isRecording) => {
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      return
    }

    // Check if Speech Recognition is available
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      if (isRecording) {
        // Restart if still recording
        try {
          recognition.start()
        } catch (e) {
          console.error('Error restarting recognition:', e)
        }
      }
    }

    recognition.start()
    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [isRecording])

  const clearTranscript = () => {
    setTranscript('')
  }

  return {
    transcript,
    clearTranscript
  }
}
