import { useState, useEffect, useRef } from "react";

export const useSpeechToText = (isRecording) => {
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[Speech-to-Text] Not supported");
      return;
    }

    // Create ONCE
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscriptRef.current += text + " ";
          } else {
            interim += text;
          }
        }

        const combined = (finalTranscriptRef.current + interim).trim();
        setTranscript(combined);

        if (combined) {
          console.log("[Speech-to-Text]", combined);
        }
      };

      recognition.onerror = (e) => {
        console.error("[Speech-to-Text] Error:", e.error);
      };

      recognition.onstart = () => {
        console.log("[Speech-to-Text] Started");
      };

      recognition.onend = () => {
        console.log("[Speech-to-Text] Ended");
        // ❌ DO NOT restart here
      };

      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;

    if (isRecording) {
      finalTranscriptRef.current = "";
      setTranscript("");

      try {
        recognition.start();
      } catch (e) {
        console.warn("[Speech-to-Text] Start blocked:", e.message);
      }
    } else {
      try {
        recognition.stop();
      } catch (e) {}
    }

    return () => {};
  }, [isRecording]);

  const clearTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
  };

  return { transcript, clearTranscript };
};
