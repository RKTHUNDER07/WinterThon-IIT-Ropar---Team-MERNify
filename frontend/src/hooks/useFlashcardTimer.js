import { useEffect, useRef, useState } from 'react'
import { FLASHCARD_CONFIG, FLASHCARD_PHRASES, getFlashcardConfig } from '../config/flashcardConfig'

/**
 * Hook for managing flashcard task timing
 * Triggers flashcards at random intervals
 */
export const useFlashcardTimer = (isEnabled, onFlashcardTrigger) => {
  const intervalRef = useRef(null)
  const config = getFlashcardConfig()

  useEffect(() => {
    // Clear any existing timer
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
    
    if (!isEnabled || !config.ENABLED) {
      return
    }

    const scheduleNextFlashcard = () => {
      // Calculate random interval between min and max
      const minInterval = config.MIN_INTERVAL_MS
      const maxInterval = config.MAX_INTERVAL_MS
      const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval

      console.log(`[Flashcard Timer] Next flashcard in ${(randomInterval / 1000).toFixed(1)} seconds`)

      intervalRef.current = setTimeout(() => {
        // Select random phrase
        const randomIndex = Math.floor(Math.random() * FLASHCARD_PHRASES.length)
        const phrase = FLASHCARD_PHRASES[randomIndex]

        console.log('[Flashcard Timer] Triggering flashcard:', phrase)

        // Trigger flashcard
        onFlashcardTrigger(phrase)

        // Schedule next flashcard (only if still enabled)
        if (isEnabled && config.ENABLED) {
          scheduleNextFlashcard()
        }
      }, randomInterval)
    }

    // Schedule first flashcard
    scheduleNextFlashcard()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEnabled, onFlashcardTrigger, config.ENABLED, config.MIN_INTERVAL_MS, config.MAX_INTERVAL_MS])
}
