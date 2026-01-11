const AudioVisualizer = ({ frequencyData, audioStatus }) => {
  const barsToShow = frequencyData.slice(0, 64)

  const getBarColor = (value, index) => {
    if (value < 0.1) {
      return 'bg-gray-200'
    }
    
    if (audioStatus === 'good') {
      return 'bg-gradient-to-t from-green-500 to-green-300'
    } else if (audioStatus === 'poor') {
      return 'bg-gradient-to-t from-yellow-500 to-yellow-300'
    } else {
      return 'bg-gradient-to-t from-red-500 to-red-300'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Audio Frequency Analysis</h3>
      <div className="flex items-end justify-center gap-1 h-48 bg-gray-50 rounded-lg p-4">
        {barsToShow.map((value, index) => {
          const height = Math.max(value * 100, 2)
          return (
            <div
              key={index}
              className={`flex-1 rounded-t transition-all duration-75 ${getBarColor(value, index)}`}
              style={{
                height: `${height}%`,
                boxShadow: value > 0.1 ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default AudioVisualizer
