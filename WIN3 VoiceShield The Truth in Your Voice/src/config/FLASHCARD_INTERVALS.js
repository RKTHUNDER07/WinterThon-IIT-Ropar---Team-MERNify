/**
 * FLASHCARD INTERVALS CONTROL
 *
 * Edit this file to control the random interval between flashcard appearances
 * All values are in milliseconds (ms)
 *
 * Example:
 * 1000 ms = 1 second
 * 60000 ms = 1 minute
 * 120000 ms = 2 minutes
 */

export const FLASHCARD_INTERVALS = {
  // MINIMUM interval between flashcards (in milliseconds)
  // Change this to make flashcards appear sooner
  //   MIN_INTERVAL_MS: 2 * 60 * 1000, // 2 minutes
  // MIN_INTERVAL_MS: 20 * 1000, // 2 minutes
  MIN_INTERVAL_MS: 2000, // 2 seconds
  MAX_INTERVAL_MS: 5000, // 5 seconds
  // MAXIMUM interval between flashcards (in milliseconds)
  // Change this to make flashcards appear later
  //   MAX_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  // MAX_INTERVAL_MS: 40 * 1000, // 5 minutes
};

/**
 * QUICK REFERENCE FOR COMMON INTERVALS:
 *
 * For Testing (short intervals):
 * MIN_INTERVAL_MS: 10 * 1000,  // 10 seconds
 * MAX_INTERVAL_MS: 30 * 1000,  // 30 seconds
 *
 * For Demo (medium intervals):
 * MIN_INTERVAL_MS: 30 * 1000,  // 30 seconds
 * MAX_INTERVAL_MS: 1 * 60 * 1000,  // 1 minute
 *
 * For Production (long intervals):
 * MIN_INTERVAL_MS: 2 * 60 * 1000,  // 2 minutes
 * MAX_INTERVAL_MS: 5 * 60 * 1000,  // 5 minutes
 *
 * For Very Long Sessions:
 * MIN_INTERVAL_MS: 5 * 60 * 1000,  // 5 minutes
 * MAX_INTERVAL_MS: 10 * 60 * 1000,  // 10 minutes
 */
