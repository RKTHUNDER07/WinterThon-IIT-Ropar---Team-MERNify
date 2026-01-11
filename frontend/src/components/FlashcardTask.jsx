import { useEffect, useState, useRef } from 'react'
import { validatePhrase, calculateSimilarity } from '../utils/phraseComparison'
import { FLASHCARD_CONFIG } from '../config/flashcardConfig'

const FlashcardTask = ({ 
  phrase, 
  onComplete, 
  onClose, 
  isRecording, 
  startRecording, 
  stopRecording,
  transcript 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(FLASHCARD_CONFIG.TASK_DURATION_SECONDS)
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState(null)
  const [liveValidation, setLiveValidation] = useState(null)
  const timerRef = useRef(null)
  const startedRef = useRef(false)
  const validationIntervalRef = useRef(null)

  useEffect(() => {
    // Auto-start recording when flashcard appears
    if (!startedRef.current && !isRecording) {
      startedRef.current = true
      const startFlashcardRecording = async () => {
        try {
          await startRecording()
        } catch (error) {
          console.error('Failed to start recording for flashcard:', error)
          onComplete({ success: false, error: 'Could not access microphone' })
        }
      }
      startFlashcardRecording()
    }

    // Start countdown timer
    if (isRecording && timeRemaining > 0 && !isValidating) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Stop recording after time expires
    if (timeRemaining === 0 && isRecording && !isValidating) {
      handleComplete()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, timeRemaining, isValidating])

  // Continuous live validation during recording
  useEffect(() => {
    if (!isRecording || isValidating || timeRemaining === 0) {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current)
        validationIntervalRef.current = null
      }
      return
    }

    // Validate every 500ms for real-time feedback
    validationIntervalRef.current = setInterval(() => {
      if (transcript && transcript.trim().length > 0) {
        const similarity = calculateSimilarity(transcript, phrase)
        const validation = validatePhrase(transcript, phrase, FLASHCARD_CONFIG.SIMILARITY_THRESHOLD)
        setLiveValidation({
          similarity,
          match: validation.match,
          isClose: similarity >= 0.5 && similarity < FLASHCARD_CONFIG.SIMILARITY_THRESHOLD
        })
      } else {
        setLiveValidation(null)
      }
    }, 500)

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current)
        validationIntervalRef.current = null
      }
    }
  }, [isRecording, transcript, phrase, isValidating, timeRemaining])

  const handleComplete = async () => {
    setIsValidating(true)
    
    // Stop recording
    if (isRecording) {
      stopRecording()
    }

    // Wait a moment for final transcription
    setTimeout(() => {
      // Check if transcript is empty (no speech detected)
      if (!transcript || transcript.trim().length === 0) {
        setResult({ match: false, similarity: 0, reason: 'No speech detected' })
        setTimeout(() => {
          onComplete({
            success: false,
            transcript: '',
            targetPhrase: phrase,
            similarity: 0,
            reason: 'No speech detected'
          })
        }, 500)
        return
      }

      const validation = validatePhrase(transcript, phrase, FLASHCARD_CONFIG.SIMILARITY_THRESHOLD)
      
      setResult(validation)
      
      // Call completion callback
      setTimeout(() => {
        onComplete({
          success: validation.match,
          transcript,
          targetPhrase: phrase,
          similarity: validation.similarity,
          reason: validation.reason
        })
      }, 1500) // Give user time to see the result
    }, 500)
  }

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current)
    }
    if (isRecording) {
      stopRecording()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          disabled={isValidating}
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Speaking Task</h2>
          <p className="text-gray-600">Please repeat the phrase below</p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className={`text-4xl font-bold ${
            timeRemaining > 3 ? 'text-primary-600' : 'text-red-600'
          }`}>
            {timeRemaining}s
          </div>
        </div>

        {/* Phrase to repeat */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
          <p className="text-xl text-center text-gray-800 font-medium leading-relaxed">
            "{phrase}"
          </p>
        </div>

        {/* Recording status */}
        <div className="text-center mb-4">
          {isRecording ? (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording... Speak now</span>
            </div>
          ) : isValidating ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Validating...</span>
            </div>
          ) : (
            <span className="text-gray-500">Recording stopped</span>
          )}
        </div>

        {/* Dedicated Transcript Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Live Transcript
            </h3>
            {isRecording && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Recording...
              </span>
            )}
          </div>
          
          {transcript && transcript.trim().length > 0 ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                <p className="text-gray-800 text-lg leading-relaxed min-h-[60px]">
                  "{transcript}"
                </p>
              </div>
              
              {/* Live Validation Feedback */}
              {liveValidation && (
                <div className={`rounded-lg p-3 border-2 ${
                  liveValidation.match 
                    ? 'bg-green-50 border-green-300' 
                    : liveValidation.isClose 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${
                      liveValidation.match 
                        ? 'text-green-800' 
                        : liveValidation.isClose 
                        ? 'text-yellow-800' 
                        : 'text-red-800'
                    }`}>
                      {liveValidation.match 
                        ? '✓ Match detected!' 
                        : liveValidation.isClose 
                        ? '⚠ Close match' 
                        : '✗ Not matching'}
                    </span>
                    <span className={`text-sm font-bold ${
                      liveValidation.match 
                        ? 'text-green-700' 
                        : liveValidation.isClose 
                        ? 'text-yellow-700' 
                        : 'text-red-700'
                    }`}>
                      {(liveValidation.similarity * 100).toFixed(1)}% similar
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        liveValidation.match 
                          ? 'bg-green-500' 
                          : liveValidation.isClose 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(liveValidation.similarity * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-center italic min-h-[60px] flex items-center justify-center">
                {isRecording ? 'Waiting for speech...' : 'No transcript available'}
              </p>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 mb-4 ${
            result.match ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}>
            <p className={`font-medium text-center ${
              result.match ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.match ? '✓ Success! Phrase matched.' : '✗ Failed to repeat the phrase correctly.'}
            </p>
            {!result.match && result.similarity > 0 && (
              <p className="text-sm text-gray-600 text-center mt-1">
                Similarity: {(result.similarity * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeRemaining > 3 ? 'bg-primary-500' : 'bg-red-500'
            }`}
            style={{ width: `${(timeRemaining / FLASHCARD_CONFIG.TASK_DURATION_SECONDS) * 100}%` }}
          />
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          {timeRemaining > 0 
            ? `Speak clearly. You have ${timeRemaining} second${timeRemaining !== 1 ? 's' : ''} remaining.`
            : 'Processing your response...'
          }
        </p>
      </div>
    </div>
  )
}

export default FlashcardTask
