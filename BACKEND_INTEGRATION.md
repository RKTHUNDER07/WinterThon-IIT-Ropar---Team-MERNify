# Backend Integration Points

This document explains where and how the backend is used in the VoiceShield application.

## 🔌 Backend Connection Points

### 1. **Login Authentication** (`frontend/src/components/Login.jsx`)

**Endpoint**: `POST /api/auth/login`

**Location**: Line 18-21
```javascript
const response = await axios.post('/api/auth/login', {
  email,
  password
})
```

**Purpose**: 
- Authenticates user credentials
- Returns authentication token
- Backend file: `backend/api/routes.py` - `login()` function

---

### 2. **Session Management** (`frontend/src/components/Dashboard.jsx`)

**Endpoint**: `POST /api/session/start`

**Location**: Line 77-79
```javascript
const response = await axios.post("/api/session/start", {
  user_id: user,
});
```

**Purpose**:
- Creates a new examination session
- Returns session ID for tracking
- Backend file: `backend/api/routes.py` - `start_session()` function

---

### 3. **Audio Validation** (`frontend/src/components/Dashboard.jsx`)

**Endpoint**: `POST /api/audio/validate`

**Location**: Line 163-167
```javascript
const response = await axios.post("/api/audio/validate", {
  audio: audioBase64,
  user_id: localStorage.getItem("voiceshield_user"),
  session_id: sessionId,
});
```

**Purpose**:
- Validates audio chunks for spoofing
- Calculates quality scores
- Detects risk levels
- Returns recommendations
- **Backend Processing**:
  - `backend/api/routes.py` - `validate_audio()` function
  - Uses `backend/services/risk_engine.py` - `calculate_quality_score()`, `calculate_risk()`
  - Uses `backend/services/spoof_detection.py` - `detect()` method
  - Uses `backend/audio/preprocess.py` - Audio preprocessing

**Response Used**:
```javascript
setQualityScore(response.data.quality_score);
setSpoofScore(response.data.spoof_score);
setRiskLevel(response.data.risk_level?.level);
setRecommendations(response.data.recommendations);
```

---

### 4. **WebSocket Connection** (`frontend/src/components/Dashboard.jsx`)

**Connection**: `http://localhost:5000`

**Location**: Line 46-58
```javascript
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
```

**Purpose**:
- Real-time bidirectional communication
- Sends audio chunks for analysis
- Receives real-time analysis results
- Backend file: `backend/api/websocket.py` - `handle_audio_stream()` function

---

### 5. **Real-time Audio Streaming** (`frontend/src/components/Dashboard.jsx`)

**WebSocket Event**: `audio_stream`

**Location**: Line 153-158
```javascript
socketRef.current.emit("audio_stream", {
  audio: audioBase64,
  session_id: sessionId,
  user_id: localStorage.getItem("voiceshield_user"),
  timestamp: Date.now(),
});
```

**Purpose**:
- Sends audio chunks to backend in real-time (every 1 second)
- Backend processes and responds with `audio_analysis` event
- Backend file: `backend/api/websocket.py` - Processes audio chunks

**Backend Processing**:
- `backend/services/spoof_detection.py` - Detects spoofing
- `backend/services/risk_engine.py` - Calculates risk and quality
- Returns results via `audio_analysis` event

---

## 📊 Backend Services Used

### 1. **Risk Engine** (`backend/services/risk_engine.py`)
- `calculate_quality_score()` - Audio quality assessment
- `calculate_risk()` - Risk level calculation
- `get_recommendations()` - Provides recommendations based on analysis
- `create_session()` - Session management
- Used by: `/api/audio/validate` endpoint

### 2. **Spoof Detection** (`backend/services/spoof_detection.py`)
- `detect()` - Main spoof detection algorithm
- `detect_playback()` - Playback detection
- `detect_muted_mic()` - Muted microphone detection
- `detect_ambient_noise()` - Ambient noise detection
- Used by: `/api/audio/validate` endpoint and WebSocket handler

### 3. **Audio Processing** (`backend/audio/preprocess.py`)
- `preprocess_audio()` - Audio preprocessing
- `extract_features()` - Feature extraction
- `calculate_snr()` - Signal-to-noise ratio
- `detect_silence()` - Silence detection
- Used by: Spoof detection and risk engine

### 4. **Speaker Verification** (`backend/services/speaker_verify.py`)
- `enroll_speaker()` - Speaker enrollment (available but not currently used)
- `verify_speaker()` - Speaker verification (available but not currently used)
- Endpoints available: `/api/audio/enroll`, `/api/audio/verify`

---

## 🔄 Data Flow

### Audio Validation Flow:
```
Frontend (Dashboard)
  ↓
1. User clicks microphone button
  ↓
2. Audio chunks captured (every 1 second)
  ↓
3. Audio converted to base64
  ↓
4a. Sent via WebSocket → backend/api/websocket.py
  ↓    → backend/services/spoof_detection.py
  ↓    → backend/services/risk_engine.py
  ↓    → Returns via 'audio_analysis' event
  ↓
4b. Sent via HTTP POST → /api/audio/validate
  ↓    → backend/api/routes.py (validate_audio)
  ↓    → backend/services/risk_engine.py
  ↓    → backend/services/spoof_detection.py
  ↓    → Returns JSON response
  ↓
5. Frontend updates UI:
   - Quality score
   - Spoof score
   - Risk level
   - Recommendations
```

---

## 📁 Backend Files Structure

```
backend/
├── app.py                    # Main Flask application
├── api/
│   ├── routes.py            # REST API endpoints
│   └── websocket.py         # WebSocket handlers
├── services/
│   ├── risk_engine.py       # Risk assessment
│   ├── spoof_detection.py   # Spoof detection algorithms
│   └── speaker_verify.py    # Speaker verification (future)
├── audio/
│   ├── preprocess.py        # Audio preprocessing
│   └── feature_extract.py   # Feature extraction
└── models/
    └── ecapa.py             # ECAPA model (placeholder)
```

---

## 🎯 Current Backend Usage Summary

### Active Backend Features:
✅ **Authentication** - Login endpoint
✅ **Session Management** - Session creation
✅ **Audio Validation** - HTTP POST endpoint (every 1 second)
✅ **Real-time Analysis** - WebSocket streaming
✅ **Spoof Detection** - Backend analysis
✅ **Risk Assessment** - Quality scores and risk levels
✅ **Recommendations** - User recommendations

### Backend Features Available but Not Currently Used:
⚠️ **Speaker Enrollment** - `/api/audio/enroll` endpoint exists
⚠️ **Speaker Verification** - `/api/audio/verify` endpoint exists
⚠️ **ECAPA Model** - Placeholder implementation (not fully integrated)

---

## 🔧 Configuration

### Frontend Proxy (`frontend/vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

This means:
- Frontend calls: `/api/auth/login`
- Gets proxied to: `http://localhost:5000/api/auth/login`

### WebSocket Connection:
- Direct connection to: `http://localhost:5000`
- Not proxied (direct Socket.IO connection)

---

## 📝 Notes

1. **Ambient Noise Detection**: Currently processed **only on frontend** using `useAudioAnalyser` hook. Backend has the method but it's not actively used in the validation flow.

2. **Audio Processing**: Backend receives audio as base64-encoded data, decodes it, and processes using NumPy/LibROSA.

3. **Error Handling**: Backend errors are caught and logged, but frontend continues gracefully (demo mode).

4. **Real-time vs HTTP**: 
   - WebSocket: Real-time streaming (faster, bidirectional)
   - HTTP: Validation endpoint (more reliable, structured responses)

Both are used simultaneously for redundancy and different use cases.
