/**
 * Logic for determining audio status
 */

import { AUDIO_THRESHOLDS } from './thresholds'

export const getAudioStatus = (averageVolume, qualityScore) => {
  if (qualityScore !== undefined && qualityScore !== null) {
    if (qualityScore >= AUDIO_THRESHOLDS.QUALITY_GOOD) {
      return 'good'
    } else if (qualityScore >= AUDIO_THRESHOLDS.QUALITY_POOR) {
      return 'poor'
    } else {
      return 'none'
    }
  }

  // Fallback to volume-based detection
  if (averageVolume > AUDIO_THRESHOLDS.GOOD_QUALITY) {
    return 'good'
  } else if (averageVolume > AUDIO_THRESHOLDS.POOR_QUALITY) {
    return 'poor'
  } else {
    return 'none'
  }
}

export const getRiskLevelColor = (riskLevel) => {
  switch (riskLevel) {
    case 'low':
      return 'text-green-500'
    case 'medium':
      return 'text-yellow-500'
    case 'high':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export const getRiskLevelBg = (riskLevel) => {
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
