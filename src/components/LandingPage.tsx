import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple validation - in production, this would connect to backend
    if (email && password) {
      // Store user session (simple localStorage for demo)
      localStorage.setItem('voiceshield_user', email)
      navigate('/dashboard')
    } else {
      setError('Please enter both email and password')
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1 className="landing-title">🎤 VoiceShield</h1>
          <p className="landing-subtitle">
            Real-time Voice Verification for Online Examinations
          </p>
        </div>

        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <p className="demo-note">
            Demo: Enter any email and password to continue
          </p>
        </div>

        <div className="landing-info">
          <p>
            Helping educators detect and prevent audio spoofing during online
            examinations
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
