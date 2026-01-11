import { getRiskLevelColor } from '../utils/statusLogic'

const StatusIndicator = ({ audioStatus, qualityScore, riskLevel, spoofScore }) => {
  const getStatusText = () => {
    if (qualityScore !== undefined && qualityScore !== null) {
      if (qualityScore >= 0.7) return 'Audio Quality: Excellent'
      if (qualityScore >= 0.4) return 'Audio Quality: Good'
      if (qualityScore >= 0.2) return 'Audio Quality: Fair'
      return 'Audio Quality: Poor'
    }
    
    switch (audioStatus) {
      case 'good':
        return 'Audio Quality: Good'
      case 'poor':
        return 'Audio Quality: Poor'
      default:
        return 'No Audio Detected'
    }
  }

  const getStatusDotColor = () => {
    if (riskLevel) {
      switch (riskLevel) {
        case 'low':
          return 'bg-green-500'
        case 'medium':
          return 'bg-yellow-500'
        case 'high':
          return 'bg-red-500'
        default:
          return 'bg-gray-500'
      }
    }
    
    switch (audioStatus) {
      case 'good':
        return 'bg-green-500'
      case 'poor':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
      <div className={`w-3 h-3 rounded-full ${getStatusDotColor()} animate-pulse`} />
      <span className="text-white font-medium">{getStatusText()}</span>
      {qualityScore !== undefined && (
        <span className="text-white/80 text-sm">({(qualityScore * 100).toFixed(0)}%)</span>
      )}
      {riskLevel && (
        <span className={`text-sm font-semibold ${getRiskLevelColor(riskLevel)}`}>
          Risk: {riskLevel.toUpperCase()}
        </span>
      )}
      {spoofScore !== undefined && spoofScore > 0.3 && (
        <span className="text-red-300 text-sm">
          ⚠️ Spoof: {(spoofScore * 100).toFixed(0)}%
        </span>
      )}
    </div>
  )
}

export default StatusIndicator
