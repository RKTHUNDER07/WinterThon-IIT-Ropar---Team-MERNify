# How to Start Both Frontend and Backend

## Quick Start Guide

### Step 1: Start Backend Server

Open a terminal/command prompt:

```bash
cd backend
python app.py
```

**Expected Output:**
```
ECAPA-TDNN model initialized (placeholder)
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

✅ Backend is now running on `http://localhost:5000`

### Step 2: Start Frontend Server

Open **another** terminal/command prompt:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ Frontend is now running on `http://localhost:5173`

### Step 3: Test Connection

1. Open your browser and go to: `http://localhost:5173`
2. You should see the login page
3. Enter any email and password (demo mode)
4. Click Login
5. You should see the Dashboard

### Step 4: Verify Connection

Open Browser DevTools (F12) and check:

1. **Console Tab**: Should see "Connected to backend" message
2. **Network Tab**: 
   - Should see API calls to `/api/auth/login`
   - Should see WebSocket connection to `ws://localhost:5000/socket.io/`
3. **No Errors**: Should not see CORS or connection errors

## Testing the Connection

### Quick API Test (Backend Running):

```bash
# Test health check
curl http://localhost:5000/

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test\"}"
```

### Using the Test Script:

```bash
cd backend
python test_api.py
```

### Using the Test HTML Page:

1. Make sure backend is running
2. Open `frontend/test_connection.html` in browser
3. Tests will run automatically

## Troubleshooting

### Port 5000 Already in Use:
- Another process is using port 5000
- Change port in `backend/app.py`: `socketio.run(app, host='0.0.0.0', port=5001, debug=True)`
- Update frontend WebSocket URL if you change port

### Port 5173 Already in Use:
- Vite will automatically use next available port
- Or specify: `npm run dev -- --port 3000`

### Backend Won't Start:
- Run: `cd backend && python check_environment.py`
- Install missing dependencies: `pip install -r requirements.txt`

### Frontend Won't Start:
- Make sure node_modules exists: `cd frontend && npm install`
- Check for errors in terminal

### Connection Fails:
1. **Backend not running?** - Check terminal 1
2. **Wrong port?** - Verify backend on 5000, frontend on 5173
3. **CORS error?** - Backend CORS is enabled, check browser console
4. **WebSocket fails?** - Check if Flask-SocketIO is working

## Expected Flow

1. ✅ Backend starts → API available at `http://localhost:5000`
2. ✅ Frontend starts → UI available at `http://localhost:5173`
3. ✅ User logs in → Frontend calls `/api/auth/login`
4. ✅ Dashboard loads → WebSocket connects to backend
5. ✅ User clicks mic → Audio analysis starts
6. ✅ Audio sent → WebSocket + HTTP validation
7. ✅ Results displayed → Frontend shows analysis

## ✅ Success Indicators

- Backend terminal shows: "Running on http://127.0.0.1:5000"
- Frontend terminal shows: "Local: http://localhost:5173/"
- Browser console shows: "Connected to backend"
- No errors in browser console or terminals
- Login works and dashboard displays
- Microphone button responds when clicked
