/**
 * Audio quality thresholds and constants
 */

export const AUDIO_THRESHOLDS = {
  GOOD_QUALITY: 30,
  POOR_QUALITY: 10,
  MIN_NOISE_LEVEL: 15,
  MAX_NOISE_LEVEL: 50,
  QUALITY_GOOD: 0.7,
  QUALITY_POOR: 0.3,
  // Ambient noise detection thresholds
  AMBIENT_NOISE_MIN: 0.5, // Very small noise level - even this indicates mic is active
  AMBIENT_NOISE_MAX: 200, // Maximum level for ambient noise
  MUTED_THRESHOLD: 0.3, // Below this very low threshold, mic is likely muted (no signal at all)
};

export const SPOOF_THRESHOLDS = {
  HIGH_RISK: 0.6,
  MEDIUM_RISK: 0.3,
  LOW_RISK: 0.0,
};

export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};
