#!/usr/bin/env python
"""Quick test script to verify backend API is working"""
import requests
import json
import time
import sys

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"Health Check Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to backend. Is the server running?")
        print(f"       Try: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"[ERROR] Health check failed: {e}")
        return False

def test_login():
    """Test the login endpoint"""
    try:
        data = {"email": "test@example.com", "password": "test123"}
        response = requests.post(f"{BASE_URL}/api/auth/login", json=data, timeout=5)
        print(f"\nLogin Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] Login test failed: {e}")
        return False

def test_session_start():
    """Test session start endpoint"""
    try:
        data = {"user_id": "test_user"}
        response = requests.post(f"{BASE_URL}/api/session/start", json=data, timeout=5)
        print(f"\nSession Start Status: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        return response.status_code == 200, result.get('session_id')
    except Exception as e:
        print(f"[ERROR] Session start test failed: {e}")
        return False, None

if __name__ == "__main__":
    print("=" * 60)
    print("Backend API Connection Test")
    print("=" * 60)
    
    print("\n[1] Testing Health Check Endpoint...")
    health_ok = test_health_check()
    
    if health_ok:
        print("\n[2] Testing Login Endpoint...")
        login_ok = test_login()
        
        print("\n[3] Testing Session Start Endpoint...")
        session_ok, session_id = test_session_start()
        
        print("\n" + "=" * 60)
        print("Test Results")
        print("=" * 60)
        print(f"Health Check: {'[PASS]' if health_ok else '[FAIL]'}")
        print(f"Login: {'[PASS]' if login_ok else '[FAIL]'}")
        print(f"Session Start: {'[PASS]' if session_ok else '[FAIL]'}")
        
        if health_ok and login_ok and session_ok:
            print("\n[SUCCESS] Backend API is working correctly!")
            print("\nNext steps:")
            print("1. Keep backend running (python app.py)")
            print("2. Start frontend in another terminal: cd frontend && npm run dev")
            print("3. Open http://localhost:5173 in browser")
            sys.exit(0)
        else:
            print("\n[WARNING] Some tests failed. Check the errors above.")
            sys.exit(1)
    else:
        print("\n[ERROR] Backend server is not running or not accessible.")
        print("\nTo start the backend server:")
        print("  cd backend")
        print("  python app.py")
        sys.exit(1)
