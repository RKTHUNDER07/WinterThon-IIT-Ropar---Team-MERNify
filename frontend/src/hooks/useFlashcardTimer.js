import { useEffect, useRef, useState } from "react";
import {
  FLASHCARD_CONFIG,
  FLASHCARD_PHRASES,
  getFlashcardConfig,
} from "../config/flashcardConfig";

/**
 * Hook for managing flashcard task timing
 * Triggers flashcards at random intervals
 */
export const useFlashcardTimer = (isEnabled, onFlashcardTrigger) => {
  const intervalRef = useRef(null);
  const config = getFlashcardConfig();
  const isEnabledRef = useRef(isEnabled);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    // Clear any existing timer
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isEnabledRef.current || !config.ENABLED) {
      return;
    }

    const scheduleNextFlashcard = () => {
      // Calculate random interval between min and max
      const minInterval = config.MIN_INTERVAL_MS;
      const maxInterval = config.MAX_INTERVAL_MS;
      const randomInterval =
        Math.random() * (maxInterval - minInterval) + minInterval;

      intervalRef.current = setTimeout(() => {
        // Only trigger if still enabled
        if (!isEnabledRef.current || !config.ENABLED) {
          return;
        }

        // Select random phrase
        const randomIndex = Math.floor(
          Math.random() * FLASHCARD_PHRASES.length
        );
        const phrase = FLASHCARD_PHRASES[randomIndex];

        // Trigger flashcard
        onFlashcardTrigger(phrase);

        // Schedule next flashcard
        scheduleNextFlashcard();
      }, randomInterval);
    };

    // Schedule first flashcard only if enabled
    if (isEnabledRef.current) {
      scheduleNextFlashcard();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    config.ENABLED,
    config.MIN_INTERVAL_MS,
    config.MAX_INTERVAL_MS,
    onFlashcardTrigger,
  ]);
};
