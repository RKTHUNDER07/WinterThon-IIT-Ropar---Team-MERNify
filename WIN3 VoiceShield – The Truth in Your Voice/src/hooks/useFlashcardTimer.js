import { useEffect, useRef } from "react";
import {
  FLASHCARD_PHRASES,
  getFlashcardConfig,
} from "../config/flashcardConfig";

export const useFlashcardTimer = (isEnabled, onFlashcardTrigger) => {
  const timeoutRef = useRef(null);
  const isEnabledRef = useRef(isEnabled);
  const configRef = useRef(getFlashcardConfig()); // 🔒 stable config

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabledRef.current || !configRef.current.ENABLED) return;

    const scheduleNext = () => {
      const { MIN_INTERVAL_MS, MAX_INTERVAL_MS } = configRef.current;

      const delay =
        Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS) + MIN_INTERVAL_MS;

      console.log("⏱ Next flashcard in", delay, "ms");

      timeoutRef.current = setTimeout(() => {
        if (!isEnabledRef.current) return;

        const phrase =
          FLASHCARD_PHRASES[
            Math.floor(Math.random() * FLASHCARD_PHRASES.length)
          ];

        onFlashcardTrigger(phrase);
        scheduleNext(); // 🔁 schedule again AFTER trigger
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [onFlashcardTrigger]);
};
