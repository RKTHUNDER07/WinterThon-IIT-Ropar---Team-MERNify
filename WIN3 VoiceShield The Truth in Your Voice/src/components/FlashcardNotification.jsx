import { useEffect } from 'react'

const FlashcardNotification = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800'
  const iconColor = type === 'error' ? 'text-red-600' : 'text-green-600'

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} border-2 rounded-lg shadow-lg p-4 max-w-md`}>
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${iconColor}`}>
            {type === 'error' ? '✗' : '✓'}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${textColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${textColor} hover:opacity-70 text-xl font-bold`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlashcardNotification
