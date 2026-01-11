const MicButton = ({ isRecording, audioStatus, onClick }) => {
  const getButtonClasses = () => {
    const baseClasses = "w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center gap-4 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
    
    if (!isRecording) {
      return `${baseClasses} bg-white text-primary-500 border-primary-500`
    }
    
    switch (audioStatus) {
      case 'good':
        return `${baseClasses} bg-green-500 text-white border-green-600 animate-pulse`
      case 'poor':
        return `${baseClasses} bg-yellow-500 text-white border-yellow-600 animate-pulse`
      default:
        return `${baseClasses} bg-red-500 text-white border-red-600 animate-pulse`
    }
  }

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isRecording ? (
          <rect x="6" y="6" width="12" height="12" rx="2" />
        ) : (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
      <span className="text-lg font-semibold">
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </span>
    </button>
  )
}

export default MicButton
