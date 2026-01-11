/**
 * Flashcard Speaking Task Configuration
 *
 * Configure the intervals and phrases for the flashcard feature
 *
 * TO CHANGE FLASHCARD INTERVALS:
 * Edit the file: src/config/FLASHCARD_INTERVALS.js
 */

import { FLASHCARD_INTERVALS } from "./FLASHCARD_INTERVALS";

// Random interval range (in milliseconds)
export const FLASHCARD_CONFIG = {
  // Minimum interval between flashcards (in milliseconds)
  // EDIT FLASHCARD_INTERVALS.js TO CHANGE THIS
  MIN_INTERVAL_MS: FLASHCARD_INTERVALS.MIN_INTERVAL_MS,

  // Maximum interval between flashcards (in milliseconds)
  // EDIT FLASHCARD_INTERVALS.js TO CHANGE THIS
  MAX_INTERVAL_MS: FLASHCARD_INTERVALS.MAX_INTERVAL_MS,

  // Recording duration for each flashcard (in milliseconds)
  RECORDING_DURATION_MS: 10 * 1000, // 10 seconds

  // Task duration in seconds (for countdown timer)
  TASK_DURATION_SECONDS: 10, // 10 seconds

  // Similarity threshold for phrase matching (0-1)
  // 0.7 means 70% similarity required
  SIMILARITY_THRESHOLD: 0.7,

  // Enable/disable flashcard feature
  ENABLED: true,
};

// Predefined phrases for flashcard tasks
export const FLASHCARD_PHRASES = [
  "Arre bhaiya, thodi si mirchi kam daal dena",
  "Jaldi utho, chai thandi ho jayegi",
  "Main aaj market se saman laaya",
  "Kal exam hai, padhna zaroori hai",
  "Mere dost ne mujhe ek achha book diya",
  "Computer science padhna bahut interesting hai",
  "Online classes mein attention dena mushkil hai",
  "Main roj subah exercise karta hoon",
  "Mere ghar mein sab log theek hain",
  "Aaj mausam bahut achha hai",
  "Mujhe coding karna pasand hai",
  "Main apne dosto ke saath baat karta hoon",
  "Yeh project bahut important hai",
  "Main har din naya kuch seekhta hoon",
  "Mere pass ek naya laptop hai",
];

// Environment-specific overrides (for future use)
// You can set these via environment variables if needed
export const getFlashcardConfig = () => {
  return {
    ...FLASHCARD_CONFIG,
    // Future: Can override with process.env values
    // MIN_INTERVAL_MS: process.env.REACT_APP_FLASHCARD_MIN_INTERVAL || FLASHCARD_CONFIG.MIN_INTERVAL_MS,
    // MAX_INTERVAL_MS: process.env.REACT_APP_FLASHCARD_MAX_INTERVAL || FLASHCARD_CONFIG.MAX_INTERVAL_MS,
  };
};
