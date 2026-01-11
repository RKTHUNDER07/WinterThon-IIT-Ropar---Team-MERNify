import { useNavigate } from 'react-router-dom'

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    localStorage.removeItem('voiceshield_user')
    navigate('/')
  }

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">🎤 VoiceShield</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
