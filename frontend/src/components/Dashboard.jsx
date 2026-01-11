import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useMicrophone } from "../hooks/useMicrophone";
import { useAudioAnalyser } from "../hooks/useAudioAnalyser";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useFlashcardTimer } from "../hooks/useFlashcardTimer";
import { getAudioStatus } from "../utils/statusLogic";
import { audioBufferToBase64 } from "../utils/audioUtils";
import Navbar from "./Navbar";
import MicButton from "./MicButton";
import AudioVisualizer from "./AudioVisualizer";
import StatusIndicator from "./StatusIndicator";
import TranscriptBox from "./TranscriptBox";
import FlashcardTask from "./FlashcardTask";
import FlashcardNotification from "./FlashcardNotification";
import {
  FLASHCARD_CONFIG,
  getFlashcardConfig,
  FLASHCARD_PHRASES,
} from "../config/flashcardConfig";

const Dashboard = () => {
  const [audioStatus, setAudioStatus] = useState("none");
  const [qualityScore, setQualityScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [spoofScore, setSpoofScore] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [flashcardPhrase, setFlashcardPhrase] = useState(null);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [flashcardNotification, setFlashcardNotification] = useState(null);
  const [isFlashcardRecording, setIsFlashcardRecording] = useState(false);
  const [flashcardTranscript, setFlashcardTranscript] = useState("");

  const { isRecording, startMicrophone, stopMicrophone, stream } =
    useMicrophone();
  const {
    frequencyData,
    averageVolume,
    noiseLevel,
    hasStaticNoise,
    hasAmbientNoise,
    isMuted,
    ambientLevel,
  } = useAudioAnalyser(stream, isRecording);
  const { transcript } = useSpeechToText(isRecording);

  const socketRef = useRef(null);
  const audioChunkIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const isRecordingPausedRef = useRef(false);
  const flashcardStartIndexRef = useRef(0);
  const isFlashcardModeRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem("voiceshield_user");
    if (!user) {
      navigate("/");
      return;
    }

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to backend");
    });

    socketRef.current.on("audio_analysis", (data) => {
      setQualityScore(data.quality_score);
      setSpoofScore(data.spoof_score);
      setRiskLevel(data.risk_level?.level || null);
    });

    // Start session
    startSession();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (audioChunkIntervalRef.current) {
        clearInterval(audioChunkIntervalRef.current);
      }
      stopMicrophone();
    };
  }, [navigate]);

  const startSession = async () => {
    try {
      const user = localStorage.getItem("voiceshield_user");
      const response = await axios.post("/api/session/start", {
        user_id: user,
      });
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Failed to start session:", error);
      // Continue anyway for demo
      setSessionId("demo-session");
    }
  };

  const handleStartRecording = async () => {
    try {
      const micStream = await startMicrophone();

      // Set up audio context for streaming to backend
      if (micStream) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.3;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(micStream);
        sourceRef.current = source;
        source.connect(analyser);

        // Resume audio context if suspended (required by browsers)
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // Start sending audio chunks to backend
        startAudioStreaming();
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please grant permissions.");
    }
  };

  const startAudioStreaming = () => {
    console.log("[AudioStreaming] 🎙️ Starting audio streaming...");
    if (audioChunkIntervalRef.current) {
      clearInterval(audioChunkIntervalRef.current);
    }

    audioChunkIntervalRef.current = setInterval(async () => {
      if (!analyserRef.current || !isRecording || !audioContextRef.current) {
        return;
      }

      // Check if audio context is running
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      try {
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(dataArray);

        // Check if we have actual audio data (not silence)
        const hasAudio = dataArray.some((sample) => Math.abs(sample) > 0.001);
        if (!hasAudio) {
          console.log("[AudioStreaming] No audio detected, skipping...");
          return; // Skip sending if no audio
        }

        console.log("[AudioStreaming] ✓ Audio detected, processing...");

        // Convert to base64
        const audioBase64 = audioBufferToBase64(dataArray);
        console.log("[AudioStreaming] ✓ Audio converted to base64");

        // Validate flashcard and control recording
        try {
          console.log(
            "[Validation] 📤 Sending validation request to /api/audio/validate..."
          );
          const validationResponse = await axios.post("/api/audio/validate", {
            audio: audioBase64,
            user_id: localStorage.getItem("voiceshield_user"),
            session_id: sessionId,
          });

          console.log(
            "[Validation] ✓ Response received:",
            validationResponse.data
          );

          // Backend returns: quality_score, spoof_score, risk_level, recommendations
          const spoofScore = validationResponse.data?.spoof_score || 0;
          const qualityScore = validationResponse.data?.quality_score || 0;

          // Consider validation FAILED if spoof score is high (> 0.7)
          const isSpoofed = spoofScore > 0.7;
          const isLowQuality = qualityScore < 0.5;

          // Validation fails if spoofing detected OR quality is too low
          const isValidationFailed = isSpoofed || isLowQuality;

          console.log(
            `[Validation] 📊 Scores - Spoof: ${spoofScore.toFixed(
              2
            )}, Quality: ${qualityScore.toFixed(
              2
            )}, Failed: ${isValidationFailed}`
          );

          if (isValidationFailed) {
            console.warn(
              `[Validation] ❌ VALIDATION FAILED - Stopping recording`
            );
            console.warn(
              `Reason: Spoofed=${isSpoofed} (${spoofScore.toFixed(
                2
              )}), LowQuality=${isLowQuality} (${qualityScore.toFixed(2)})`
            );
            handleStopRecording();
            return; // Stop processing immediately
          } else {
            // Continue recording when validation passes
            console.log("[Validation] ✅ PASSED - Recording continues");
            isRecordingPausedRef.current = false;
          }
        } catch (error) {
          console.error("[Validation] ❌ API Error:", error.message);
          if (error.response) {
            console.error("[Validation] Status:", error.response.status);
            console.error("[Validation] Data:", error.response.data);
          }
          console.error("[Validation] Full error:", error);
          // On error, continue recording
          isRecordingPausedRef.current = false;
        }

        // Check if recording was stopped
        if (!isRecording) {
          console.log(
            "[Recording] Recording state is false, exiting audio streaming"
          );
          return;
        }

        // Send to backend via WebSocket
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("audio_stream", {
            audio: audioBase64,
            session_id: sessionId,
            user_id: localStorage.getItem("voiceshield_user"),
            timestamp: Date.now(),
          });
        }

        // Also send via HTTP for quality metrics (not flashcard validation)
        try {
          const response = await axios.post("/api/audio/validate", {
            audio: audioBase64,
            user_id: localStorage.getItem("voiceshield_user"),
            session_id: sessionId,
          });

          if (response.data) {
            setQualityScore(response.data.quality_score);
            setSpoofScore(response.data.spoof_score);
            setRiskLevel(response.data.risk_level?.level || null);
            if (response.data.recommendations) {
              setRecommendations(response.data.recommendations);
            }
          }
        } catch (error) {
          // Silent fail for demo
          console.error("Validation error:", error);
        }
      } catch (error) {
        console.error("Audio streaming error:", error);
      }
    }, 1000); // Send chunk every second
  };

  const handleStopRecording = () => {
    stopMicrophone();
    if (audioChunkIntervalRef.current) {
      clearInterval(audioChunkIntervalRef.current);
      audioChunkIntervalRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioStatus("none");
    setQualityScore(null);
    setRiskLevel(null);
    setSpoofScore(null);
    setRecommendations([]);
  };

  // Update audio status based on quality score or volume
  useEffect(() => {
    const status = getAudioStatus(averageVolume, qualityScore);
    setAudioStatus(status);
  }, [averageVolume, qualityScore]);

  // Flashcard timer - triggers flashcards at random intervals
  // const handleFlashcardTrigger = (phrase) => {
  //   // Only show flashcard if not already showing one and user is logged in
  //   // if (!showFlashcard && !isFlashcardRecording) {
  //   //   setFlashcardPhrase(phrase);
  //   //   setShowFlashcard(true);
  //   //   setFlashcardTranscript(""); // Clear previous transcript
  //   // }

  //   flashcardStartIndexRef.current = transcript.length;
  //   setFlashcardPhrase(phrase);
  //   setFlashcardTranscript("");
  //   setShowFlashcard(true);
  //   setIsFlashcardRecording(true);
  // };
  const handleFlashcardTrigger = useCallback(
    (phrase) => {
      flashcardStartIndexRef.current = transcript.length;
      setFlashcardPhrase(phrase);
      setFlashcardTranscript("");
      setShowFlashcard(true);
      setIsFlashcardRecording(true);
    },
    [transcript]
  );

  const config = getFlashcardConfig();
  // Only run flashcard timer when recording is active
  // Use a ref to avoid constant timer resets from state changes
  const recordingRef = useRef(isRecording);

  useEffect(() => {
    recordingRef.current = isRecording;
  }, [isRecording]);

  // useFlashcardTimer(
  //   recordingRef.current && config.ENABLED,
  //   handleFlashcardTrigger
  // );

  useFlashcardTimer(
    isRecording && !showFlashcard && !isFlashcardRecording && config.ENABLED,
    handleFlashcardTrigger
  );
  // Handle flashcard recording start/stop
  const handleFlashcardStartRecording = async () => {
    try {
      // Clear transcript before starting
      setFlashcardTranscript("");
      setIsFlashcardRecording(true);
      await startMicrophone();
      console.log("[Flashcard] Recording started for flashcard");
    } catch (error) {
      console.error("Failed to start recording for flashcard:", error);
      setFlashcardNotification({
        message: "Could not access microphone. Please grant permissions.",
        type: "error",
      });
      setShowFlashcard(false);
      setIsFlashcardRecording(false);
    }
  };

  const handleFlashcardStopRecording = () => {
    stopMicrophone();
    setIsFlashcardRecording(false);
  };

  // Use flashcard-specific speech-to-text when flashcard is active
  const { transcript: flashcardSTT } = useSpeechToText(
    isFlashcardRecording && showFlashcard
  );

  useEffect(() => {
    if (isFlashcardRecording && showFlashcard && flashcardSTT) {
      // Update transcript whenever it changes
      setFlashcardTranscript(flashcardSTT);
      // Debug logging for testing transcript feature
      if (flashcardSTT.trim().length > 0) {
        console.log("[Flashcard] Transcript:", flashcardSTT);
      }
    }
  }, [flashcardSTT, isFlashcardRecording, showFlashcard]);

  // Clear transcript when flashcard closes
  // useEffect(() => {
  //   if (!showFlashcard && !isFlashcardRecording) {
  //     setFlashcardTranscript("");
  //   }
  // }, [showFlashcard, isFlashcardRecording]);

  useEffect(() => {
    if (!isFlashcardModeRef.current) return;

    const spoken = transcript.slice(flashcardStartIndexRef.current);
    setFlashcardTranscript(spoken.trim());
  }, [transcript]);

  const handleFlashcardComplete = (result) => {
    // Validate flashcard response
    console.log("[Flashcard] Validation result:", result);

    if (result.success) {
      console.log("[Flashcard] ✅ PASSED - Continuing recording");
      // Continue recording
      isRecordingPausedRef.current = false;
    } else {
      console.log("[Flashcard] ❌ FAILED - Stopping recording");
      // Stop recording when flashcard validation fails
      handleStopRecording();
    }

    // Close flashcard UI
    setShowFlashcard(false);
    setIsFlashcardRecording(false);
    setFlashcardTranscript("");

    // EXIT flashcard mode
    isFlashcardModeRef.current = false;

    setFlashcardNotification({
      message: result.success
        ? "Great! You successfully repeated the phrase."
        : "Failed to repeat the phrase.",
      type: result.success ? "success" : "error",
    });

    setTimeout(() => setFlashcardNotification(null), 4000);
  };

  const handleFlashcardClose = () => {
    setShowFlashcard(false);
    setIsFlashcardRecording(false);
    handleFlashcardStopRecording();
    setFlashcardPhrase(null);
    setFlashcardTranscript("");
  };

  // Manual trigger for testing flashcard
  const handleTestFlashcard = () => {
    if (showFlashcard || isFlashcardRecording) {
      return; // Don't trigger if already showing a flashcard
    }
    // Select a random phrase
    const randomIndex = Math.floor(Math.random() * FLASHCARD_PHRASES.length);
    const phrase = FLASHCARD_PHRASES[randomIndex];
    handleFlashcardTrigger(phrase);
  };

  const handleLogout = () => {
    handleStopRecording();
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    localStorage.removeItem("voiceshield_user");
    localStorage.removeItem("voiceshield_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar onLogout={handleLogout} />

      {/* Flashcard Task Modal */}
      {showFlashcard && flashcardPhrase && (
        <FlashcardTask
          phrase={flashcardPhrase}
          onComplete={handleFlashcardComplete}
          onClose={handleFlashcardClose}
          isRecording={isFlashcardRecording}
          startRecording={handleFlashcardStartRecording}
          stopRecording={handleFlashcardStopRecording}
          transcript={flashcardTranscript}
        />
      )}

      {/* Flashcard Notification */}
      {flashcardNotification && (
        <FlashcardNotification
          message={flashcardNotification.message}
          type={flashcardNotification.type}
          onClose={() => setFlashcardNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <MicButton
            isRecording={isRecording}
            audioStatus={audioStatus}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          />
          <div className="mt-6">
            <StatusIndicator
              audioStatus={audioStatus}
              qualityScore={qualityScore}
              riskLevel={riskLevel}
              spoofScore={spoofScore}
            />
          </div>
          {/* Test Flashcard Button */}
          <button
            onClick={handleTestFlashcard}
            disabled={showFlashcard || isFlashcardRecording}
            className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
            title="Test Flashcard Task (for testing purposes)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Test Flashcard Task
          </button>
        </div>

        <div className="mb-6">
          <AudioVisualizer
            frequencyData={frequencyData}
            audioStatus={audioStatus}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Microphone Status & Ambient Noise
            </h3>

            {/* Ambient Noise Detection */}
            {/* {<div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ambient Noise:</span>
                <span className={`text-sm font-semibold ${
                  hasAmbientNoise ? 'text-green-600' : isMuted ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {hasAmbientNoise ? '✅ Detected' : isMuted ? '❌ Muted/Silent' : '⏳ Checking...'}
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    hasAmbientNoise 
                      ? 'bg-green-500' 
                      : isMuted 
                      ? 'bg-red-500' 
                      : 'bg-yellow-400'
                  } ${hasAmbientNoise ? 'animate-pulse' : ''}`}
                  style={{ width: `${Math.min((ambientLevel / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Level: {ambientLevel.toFixed(3)} | {isMuted ? '⚠️ Microphone appears muted (no signal detected)' : hasAmbientNoise ? '✅ Microphone is active (ambient noise detected)' : '⏳ Analyzing...'}
              </p>
            </div>} */}

            {/* Static Noise Detection */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Static Noise:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    hasStaticNoise ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {hasStaticNoise ? "✅ Detected" : "Not detected"}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all ${
                    hasStaticNoise ? "animate-pulse" : ""
                  }`}
                  style={{
                    width: `${Math.min((noiseLevel / 50) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Low-frequency noise level: {noiseLevel.toFixed(1)}
              </p>
            </div>
          </div>

          <TranscriptBox transcript={transcript} isRecording={isRecording} />
        </div>

        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <span className="text-primary-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
