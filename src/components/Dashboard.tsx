import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioStatus, setAudioStatus] = useState<'good' | 'poor' | 'none'>('none')
  const [transcript, setTranscript] = useState('')
  const [frequencyData, setFrequencyData] = useState<number[]>([])
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [hasStaticNoise, setHasStaticNoise] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)

  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('voiceshield_user')
    if (!user) {
      navigate('/')
    }

    // Cleanup on unmount
    return () => {
      stopRecording()
    }
  }, [navigate])

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      streamRef.current = stream

      // Set up Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const microphone = audioContext.createMediaStreamSource(stream)
      microphoneRef.current = microphone
      microphone.connect(analyser)

      // Set up speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
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

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      setIsRecording(true)
      analyzeAudio()

      // Check for static noise (background noise detection)
      checkStaticNoise(analyser)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please grant permissions.')
    }
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const updateFrequency = () => {
      analyser.getByteFrequencyData(dataArray)
      const normalizedData = Array.from(dataArray).map((value) => value / 255)
      setFrequencyData(normalizedData)

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      
      // Determine audio status
      if (average > 30) {
        setAudioStatus('good')
      } else if (average > 10) {
        setAudioStatus('poor')
      } else {
        setAudioStatus('none')
      }

      animationFrameRef.current = requestAnimationFrame(updateFrequency)
    }

    updateFrequency()
  }

  const checkStaticNoise = (analyser: AnalyserNode) => {
    const checkInterval = setInterval(() => {
      if (!isRecording) {
        clearInterval(checkInterval)
        return
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      
      // Calculate noise level (average of low frequencies indicates static/hum)
      const lowFreqSum = Array.from(dataArray.slice(0, 20)).reduce((a, b) => a + b, 0)
      const lowFreqAvg = lowFreqSum / 20
      setNoiseLevel(lowFreqAvg)

      // If there's consistent low-frequency noise, it might be static
      if (lowFreqAvg > 15 && lowFreqAvg < 50) {
        setHasStaticNoise(true)
      } else {
        setHasStaticNoise(false)
      }
    }, 500)
  }

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    setIsRecording(false)
    setAudioStatus('none')
    setFrequencyData([])
    setTranscript('')
    setNoiseLevel(0)
    setHasStaticNoise(false)
  }

  const handleLogout = () => {
    stopRecording()
    localStorage.removeItem('voiceshield_user')
    navigate('/')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎤 VoiceShield Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="main-control">
          <button
            className={`mic-button ${isRecording ? 'recording' : ''} ${audioStatus}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isRecording ? (
                <rect x="6" y="6" width="12" height="12" rx="2" />
              ) : (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </>
              )}
            </svg>
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          <div className="status-indicator">
            <div className={`status-dot ${audioStatus}`}></div>
            <span>
              {audioStatus === 'good'
                ? 'Audio Quality: Good'
                : audioStatus === 'poor'
                ? 'Audio Quality: Poor'
                : 'No Audio Detected'}
            </span>
          </div>
        </div>

        <div className="frequency-visualizer">
          <h3>Audio Frequency Analysis</h3>
          <div className="frequency-bars">
            {frequencyData.slice(0, 64).map((value, index) => {
              const height = value * 100
              const isActive = value > 0.1
              return (
                <div
                  key={index}
                  className={`frequency-bar ${isActive ? (audioStatus === 'good' ? 'active-green' : 'active-red') : ''}`}
                  style={{
                    height: `${Math.max(height, 2)}%`,
                  }}
                />
              )
            })}
          </div>
        </div>

        <div className="audio-info">
          <div className="info-card">
            <h3>Static Noise Detection</h3>
            <div className="noise-indicator">
              <div
                className={`noise-bar ${hasStaticNoise ? 'detected' : ''}`}
                style={{ width: `${Math.min((noiseLevel / 50) * 100, 100)}%` }}
              />
            </div>
            <p>
              {hasStaticNoise
                ? '✅ Static noise detected - Audio feed is active'
                : '⏳ Checking for static noise...'}
            </p>
            <p className="noise-level">Noise Level: {noiseLevel.toFixed(1)}</p>
          </div>

          <div className="info-card">
            <h3>Live Speech-to-Text</h3>
            <div className="transcript-box">
              {transcript || (
                <span className="placeholder">
                  {isRecording
                    ? 'Listening... Speak into your microphone'
                    : 'Start recording to see live transcription'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
