/**
 * Phrase comparison utilities for flashcard validation
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0
  
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0
  
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Check if spoken text matches the target phrase
 * Uses similarity threshold and also checks for key words
 */
export const validatePhrase = (spokenText, targetPhrase, threshold = 0.7) => {
  if (!spokenText || spokenText.trim().length === 0) {
    return { match: false, similarity: 0, reason: 'No speech detected' }
  }
  
  const similarity = calculateSimilarity(spokenText, targetPhrase)
  
  if (similarity >= threshold) {
    return { match: true, similarity, reason: 'Phrase matches' }
  }
  
  // Also check if key words are present (more lenient matching)
  const targetWords = targetPhrase.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const spokenWords = spokenText.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  const matchingWords = targetWords.filter(word => 
    spokenWords.some(sw => sw.includes(word) || word.includes(sw))
  )
  
  const wordMatchRatio = matchingWords.length / targetWords.length
  
  if (wordMatchRatio >= 0.6 && similarity >= 0.5) {
    return { match: true, similarity: (similarity + wordMatchRatio) / 2, reason: 'Key words match' }
  }
  
  return { match: false, similarity, reason: 'Phrase does not match' }
}

/**
 * Clean and normalize text for comparison
 */
export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
}
