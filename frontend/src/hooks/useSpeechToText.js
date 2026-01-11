import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for speech-to-text conversion
 */
export const useSpeechToText = (isRecording) => {
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('') // Store accumulated final transcript

  useEffect(() => {
    if (!isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      finalTranscriptRef.current = '' // Reset when not recording
      setTranscript('')
      return
    }

    // Check if Speech Recognition is available
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('[Speech-to-Text] Speech Recognition not supported in this browser')
      return
    }

    // Reset transcript when starting
    finalTranscriptRef.current = ''
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    // Use English as default (more reliable)
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('[Speech-to-Text] Recognition started')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''

      // Process all results from the last resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          // Accumulate final transcripts
          finalTranscriptRef.current += transcript + ' '
        } else {
          // Show interim results
          interimTranscript += transcript
        }
      }

      // Combine accumulated final transcript with current interim
      const combinedTranscript = (finalTranscriptRef.current + interimTranscript).trim()
      setTranscript(combinedTranscript)
      
      // Debug logging
      if (combinedTranscript.length > 0) {
        console.log('[Speech-to-Text] Transcript:', combinedTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('[Speech-to-Text] Error:', event.error, event)
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        console.log('[Speech-to-Text] No speech detected, continuing...')
      } else if (event.error === 'audio-capture') {
        console.error('[Speech-to-Text] No microphone found')
      } else if (event.error === 'not-allowed') {
        console.error('[Speech-to-Text] Microphone permission denied')
      }
    }

    recognition.onend = () => {
      console.log('[Speech-to-Text] Recognition ended')
      if (isRecording) {
        // Restart if still recording
        try {
          recognition.start()
        } catch (e) {
          console.error('[Speech-to-Text] Error restarting:', e)
        }
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      console.log('[Speech-to-Text] Starting recognition...')
    } catch (error) {
      console.error('[Speech-to-Text] Failed to start:', error)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error('[Speech-to-Text] Error stopping:', e)
        }
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
