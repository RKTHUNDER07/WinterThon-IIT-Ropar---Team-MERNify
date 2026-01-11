
# 🎙️ VoiceShield

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

* 🛑 **Spoof & Manipulation Detection**

  * Playback attack detection
  * Muted / near-muted microphone detection
  * Artificial or manipulated audio patterns

* 🧠 **Speaker Verification (Framework Ready)**
  ECAPA-TDNN–based speaker embedding and verification pipeline (placeholder).

* ⚠️ **Risk Assessment Engine**
  Real-time risk scoring with actionable recommendations.

* 📝 **Live Speech-to-Text**
  Real-time transcription using the browser’s Web Speech API.

* 🔁 **WebSocket-Based Communication**
  Low-latency bidirectional streaming between frontend and backend.

* 🧪 **Flashcard Phrase Testing**
  Controlled phrase verification for demos and testing.

---

## 🏗️ Project Architecture

This is a **full-stack web application** consisting of:

### Frontend

* React 18 (SPA)
* Vite
* Tailwind CSS
* Socket.IO Client
* Axios
* Web Audio API
* Web Speech API

### Backend

* Python 3.8+
* Flask
* Flask-SocketIO
* NumPy
* Librosa

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

### Frontend

* Captures microphone input
* Analyzes frequency & energy using Web Audio API
* Transcribes speech live
* Streams audio chunks to backend
* Displays quality metrics, risk level, and recommendations

### Backend

* Receives audio via WebSockets
* Converts Base64 → NumPy arrays
* Runs:

  * SNR analysis
  * Energy consistency checks
  * Spectral centroid analysis
  * Silence & playback detection
* Aggregates results using a risk engine
* Sends real-time feedback to client

---

## ▶️ Running the Project

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access the App

```
http://localhost:5173
```

*(Demo login – use any credentials)*

---

## 🧪 Demo Use Cases

* Online examinations
* Remote viva & interviews
* Proctored assessments
* Voice-based authentication testing

---

## 📌 Future Enhancements

* Full ECAPA-TDNN speaker verification integration
* ML-based spoof classification models
* Admin dashboard for examiners
* Cloud deployment (Docker + AWS/GCP)

---

## 📄 License

This project is for academic and research purposes.
Feel free to fork and extend with proper attribution.



