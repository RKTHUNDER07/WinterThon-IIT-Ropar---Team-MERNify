# VoiceShield Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Login with any email and password (demo mode)
3. Click the microphone button to start recording
4. Grant microphone permissions when prompted
5. Speak into your microphone to see real-time analysis

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
- Change the port in `backend/app.py`:
  ```python
  socketio.run(app, host='0.0.0.0', port=5001, debug=True)
  ```
- Update frontend proxy in `frontend/vite.config.js` if needed

**Python dependencies not installing:**
- Make sure you're using Python 3.8 or higher
- Try upgrading pip: `pip install --upgrade pip`
- Some packages may require system dependencies (e.g., librosa requires ffmpeg)

**Import errors:**
- Make sure all `__init__.py` files are present in backend directories
- Verify virtual environment is activated

### Frontend Issues

**Port 5173 already in use:**
- Vite will automatically use the next available port
- Or specify a port: `npm run dev -- --port 3000`

**Module not found errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Socket connection errors:**
- Make sure backend is running
- Check CORS settings in `backend/app.py`
- Verify WebSocket URL in `frontend/src/components/Dashboard.jsx`

**Microphone not working:**
- Check browser permissions
- Use Chrome or Edge for best compatibility
- HTTPS is required for microphone access in production (not needed for localhost)

### Audio Analysis Not Working

- Check browser console for errors
- Verify microphone permissions are granted
- Ensure backend is running and accessible
- Check network tab for API/WebSocket errors

## Development Tips

1. **Backend Logs**: Check the terminal where Flask is running for server logs
2. **Frontend Logs**: Check browser console (F12) for client-side errors
3. **Hot Reload**: Both frontend and backend support hot reload during development
4. **API Testing**: Use tools like Postman or curl to test backend endpoints directly

## Production Deployment

### Backend
- Use a production WSGI server like Gunicorn
- Set up proper environment variables
- Configure CORS for your domain
- Use a reverse proxy (nginx) for HTTPS

### Frontend
- Build the production bundle: `npm run build`
- Serve the `dist` folder using a web server
- Configure API proxy or use environment variables for API URL

## Next Steps

1. Integrate a real ECAPA-TDNN model for speaker verification
2. Add database for session storage
3. Implement proper authentication
4. Add more sophisticated spoof detection algorithms
5. Deploy to a cloud platform
