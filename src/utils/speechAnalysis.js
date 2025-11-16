// Word repetition detection algorithm
export function detectWordRepetition(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      totalWords: 0,
      totalRepetitions: 0,
      repetitionRate: 0,
      repeatedWords: [],
      wordFrequency: {}
    }
  }

  // Clean and normalize the transcript
  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0)

  // Count word frequency
  const wordFrequency = {}
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  })

  // Filter out common filler words and short words
  const fillerWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'well', 'actually', 'basically'
  ])

  // Find repeated words (excluding fillers and words shorter than 3 characters)
  const repeatedWords = Object.entries(wordFrequency)
    .filter(([word, count]) => 
      count > 1 && 
      word.length >= 3 && 
      !fillerWords.has(word)
    )
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending

  // Calculate total repetitions (extra occurrences beyond the first)
  const totalRepetitions = repeatedWords.reduce((sum, [, count]) => sum + (count - 1), 0)
  
  // Calculate repetition rate
  const totalWords = words.length
  const repetitionRate = totalWords > 0 ? (totalRepetitions / totalWords) * 100 : 0

  return {
    totalWords,
    totalRepetitions,
    repetitionRate,
    repeatedWords,
    wordFrequency
  }
}

// Analyze speech patterns over time
export function analyzeSpeechPatterns(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      averageRepetitionRate: 0,
      trend: 'stable',
      improvement: 0,
      commonRepeatedWords: []
    }
  }

  // Calculate average repetition rate
  const averageRepetitionRate = sessions.reduce((sum, session) => 
    sum + (session.repetition_rate || 0), 0) / sessions.length

  // Calculate trend (improvement over time)
  let trend = 'stable'
  let improvement = 0
  
  if (sessions.length >= 2) {
    const recent = sessions.slice(-3) // Last 3 sessions
    const earlier = sessions.slice(0, -3) // Earlier sessions
    
    if (recent.length > 0 && earlier.length > 0) {
      const recentAvg = recent.reduce((sum, s) => sum + s.repetition_rate, 0) / recent.length
      const earlierAvg = earlier.reduce((sum, s) => sum + s.repetition_rate, 0) / earlier.length
      
      improvement = earlierAvg - recentAvg // Positive means improvement
      
      if (improvement > 2) {
        trend = 'improving'
      } else if (improvement < -2) {
        trend = 'declining'
      }
    }
  }

  // Find most common repeated words across all sessions
  const allRepeatedWords = {}
  sessions.forEach(session => {
    if (session.repeated_words) {
      Object.entries(session.repeated_words).forEach(([word, count]) => {
        allRepeatedWords[word] = (allRepeatedWords[word] || 0) + count
      })
    }
  })

  const commonRepeatedWords = Object.entries(allRepeatedWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return {
    averageRepetitionRate,
    trend,
    improvement,
    commonRepeatedWords
  }
}