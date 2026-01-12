
# 🎙️ VoiceShield - https://win-3-voice-shield.vercel.app/

**Real-Time Voice Integrity & Spoof Detection System**

VoiceShield is a real-time voice verification and audio integrity monitoring system designed to detect malicious microphone manipulation during online examinations, interviews, and viva sessions. It ensures **fairness, authenticity, and trust** in remote assessments by identifying audio spoofing, playback attacks, muted microphones, and degraded audio quality in real time.

---

## 🚀 Features

* 🔴 **Real-Time Audio Monitoring**
  Continuous microphone feed analysis with instant visual feedback.

* 📊 **Frequency Spectrum Visualization**
  Dynamic audio bars with color-coded status indicators.

* 🎚️ **Audio Quality Assessment**
  Automatic evaluation of:

  * Signal-to-Noise Ratio (SNR)
  * Energy consistency
  * Frequency content

* 🧠 **Speaker Verification (Framework Ready)**
  ECAPA-TDNN–based speaker embedding and verification pipeline (placeholder).

* 📝 **Live Speech-to-Text**
  Real-time transcription using the browser’s Web Speech API.

* 🧪 **Flashcard Phrase Testing**
  Controlled phrase verification for demos and testing.

---

## 🏗️ Project Architecture

This is a **full-stack web application** consisting of:

* React 18 (SPA)
* Vite
* Tailwind CSS
* Axios
* Web Audio API
* Web Speech API

---
## 📂 Folder Structure
```
WIN3 VoiceShield – The Truth in Your Voice
│
├── node_modules/
│
├── src/
│   ├── components/
│   │   ├── AudioVisualizer.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FlashcardIntervalController.jsx
│   │   ├── FlashcardNotification.jsx
│   │   ├── FlashcardTask.jsx
│   │   ├── Login.jsx
│   │   ├── MicButton.jsx
│   │   ├── Navbar.jsx
│   │   ├── StatusIndicator.jsx
│   │   └── TranscriptBox.jsx
│   │
│   ├── config/
│   │   ├── FLASHCARD_INTERVALS.js
│   │   └── flashcardConfig.js
│   │
│   ├── hooks/
│   │   ├── useAudioAnalyser.js
│   │   ├── useFlashcardTimer.js
│   │   ├── useMicrophone.js
│   │   └── useSpeechToText.js
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── utils/
│   │   ├── audioUtils.js
│   │   ├── phraseComparison.js
│   │   ├── statusLogic.js
│   │   └── thresholds.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── .gitignore
└── README.md
```
---
## 🔄 Data Flow
1. User clicks microphone button → browser requests mic access
2. Audio stream captured → Web Audio API extracts features
3. Audio chunks converted to Base64 → streamed every **100ms**
4. Backend decodes audio → runs spoof detection & quality analysis
5. Risk scores and recommendations emitted back to frontend
6. UI updates continuously in real time
---
## ⚙️ How It Works
* Captures microphone input
* Analyzes frequency & energy using Web Audio API
* Transcribes speech live
* Streams audio chunks to backend
* Displays quality metrics, risk level, and recommendation
---
## ▶️ Running the Project
### Setup
```bash
npm install
npm run dev
```
### Access the App
```
http://localhost:5173
```
---
## 🧪 Demo Use Cases
* Online examinations
* Remote viva & interviews
* Proctored assessments
* Voice-based authentication testing
---
## 📌 Future Enhancements

* ML-based spoof classification models
* Teacher/Admin dashboard
* Voice-based video controls for ViBe platform
* Ambient mode

---
## 📄 License
This project is for academic and research purposes.
Feel free to fork and extend with proper attribution.










