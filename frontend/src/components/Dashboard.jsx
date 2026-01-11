import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useMicrophone } from "../hooks/useMicrophone";
import { useAudioAnalyser } from "../hooks/useAudioAnalyser";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { getAudioStatus } from "../utils/statusLogic";
import { audioBufferToBase64 } from "../utils/audioUtils";
import Navbar from "./Navbar";
import MicButton from "./MicButton";
import AudioVisualizer from "./AudioVisualizer";
import StatusIndicator from "./StatusIndicator";
import TranscriptBox from "./TranscriptBox";

const Dashboard = () => {
  const [audioStatus, setAudioStatus] = useState("none");
  const [qualityScore, setQualityScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [spoofScore, setSpoofScore] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const { isRecording, startMicrophone, stopMicrophone, stream } =
    useMicrophone();
  const { frequencyData, averageVolume, noiseLevel, hasStaticNoise } =
    useAudioAnalyser(stream, isRecording);
  const { transcript } = useSpeechToText(isRecording);

  const socketRef = useRef(null);
  const audioChunkIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
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
          return; // Skip sending if no audio
        }

        // Convert to base64
        const audioBase64 = audioBufferToBase64(dataArray);

        // Send to backend via WebSocket
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("audio_stream", {
            audio: audioBase64,
            session_id: sessionId,
            user_id: localStorage.getItem("voiceshield_user"),
            timestamp: Date.now(),
          });
        }

        // Also send via HTTP for validation
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
              Static Noise Detection
            </h3>
            <div className="w-full h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all ${
                  hasStaticNoise ? "animate-pulse" : ""
                }`}
                style={{ width: `${Math.min((noiseLevel / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-gray-700 mb-2">
              {hasStaticNoise
                ? "✅ Static noise detected - Audio feed is active"
                : "⏳ Checking for static noise..."}
            </p>
            <p className="text-sm text-primary-600 font-semibold">
              Noise Level: {noiseLevel.toFixed(1)}
            </p>
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
