// Advanced Speech Analysis - Sentiment, Pacing, Voice Quality
export class AdvancedSpeechAnalyzer {
  constructor() {
    this.pauseThreshold = 500 // ms
    this.sentimentKeywords = {
      positive: [
        'excellent', 'amazing', 'fantastic', 'great', 'wonderful', 'outstanding', 
        'successful', 'excited', 'confident', 'proud', 'happy', 'thrilled',
        'innovative', 'breakthrough', 'achievement', 'opportunity', 'growth'
      ],
      negative: [
        'difficult', 'challenging', 'problem', 'issue', 'concern', 'worried',
        'frustrated', 'disappointed', 'failed', 'mistake', 'error', 'struggle',
        'unfortunately', 'however', 'but', 'although', 'despite'
      ],
      confidence: [
        'definitely', 'certainly', 'absolutely', 'clearly', 'obviously',
        'undoubtedly', 'precisely', 'exactly', 'specifically', 'guaranteed'
      ],
      uncertainty: [
        'maybe', 'perhaps', 'possibly', 'might', 'could', 'probably',
        'seems', 'appears', 'sort of', 'kind of', 'i think', 'i guess'
      ]
    }
  }

  // Analyze sentiment and emotional tone
  analyzeSentiment(transcript) {
    const words = transcript.toLowerCase().split(/\s+/)
    const totalWords = words.length

    let scores = {
      positive: 0,
      negative: 0,
      confidence: 0,
      uncertainty: 0
    }

    // Count sentiment indicators
    words.forEach(word => {
      Object.keys(this.sentimentKeywords).forEach(category => {
        if (this.sentimentKeywords[category].includes(word)) {
          scores[category]++
        }
      })
    })

    // Calculate percentages
    const sentimentAnalysis = {
      positive: Math.round((scores.positive / totalWords) * 100),
      negative: Math.round((scores.negative / totalWords) * 100),
      confidence: Math.round((scores.confidence / totalWords) * 100),
      uncertainty: Math.round((scores.uncertainty / totalWords) * 100),
      neutrality: Math.max(0, 100 - scores.positive - scores.negative),
      
      // Overall sentiment score (-100 to +100)
      overallSentiment: scores.positive - scores.negative,
      
      // Confidence level (0-100)
      confidenceLevel: Math.max(0, Math.min(100, (scores.confidence - scores.uncertainty) * 10 + 50)),
      
      // Emotional energy (based on positive words and exclamation usage)
      energyLevel: this.calculateEnergyLevel(transcript, scores.positive),
      
      recommendations: this.getSentimentRecommendations(scores, totalWords)
    }

    return sentimentAnalysis
  }

  // Analyze speaking pace and pauses
  analyzePacing(transcript, duration) {
    const words = transcript.split(/\s+/).filter(word => word.length > 0)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Estimate pauses (simplified - in real implementation would use audio analysis)
    const estimatedPauses = this.estimatePauses(transcript)
    
    const pacingAnalysis = {
      wordsPerMinute: Math.round((words.length / duration) * 60),
      totalWords: words.length,
      totalSentences: sentences.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      
      // Pause analysis (estimated)
      estimatedPauses: estimatedPauses.total,
      pauseDistribution: estimatedPauses.distribution,
      averagePauseLength: estimatedPauses.averageLength,
      
      // Pacing quality assessment
      pacingQuality: this.assessPacingQuality(words.length, duration),
      
      recommendations: this.getPacingRecommendations(words.length, duration, estimatedPauses)
    }

    return pacingAnalysis
  }

  // Analyze voice quality indicators (based on transcript patterns)
  analyzeVoiceQuality(transcript, recognitionConfidence = 85) {
    const words = transcript.split(/\s+/)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Analyze text patterns that indicate voice quality
    const voiceAnalysis = {
      clarity: this.estimateClarity(transcript, recognitionConfidence),
      articulation: this.estimateArticulation(transcript),
      variation: this.estimateVoiceVariation(transcript),
      projection: this.estimateProjection(transcript),
      
      // Overall voice quality score
      overallQuality: 0,
      
      recommendations: []
    }

    // Calculate overall quality
    voiceAnalysis.overallQuality = Math.round(
      (voiceAnalysis.clarity + voiceAnalysis.articulation + 
       voiceAnalysis.variation + voiceAnalysis.projection) / 4
    )

    voiceAnalysis.recommendations = this.getVoiceRecommendations(voiceAnalysis)

    return voiceAnalysis
  }

  // Public speaking specific analysis
  analyzePublicSpeaking(transcript, duration, presentationType = 'general') {
    const sentiment = this.analyzeSentiment(transcript)
    const pacing = this.analyzePacing(transcript, duration)
    const voice = this.analyzeVoiceQuality(transcript)
    
    const publicSpeakingAnalysis = {
      // Core metrics
      overallScore: this.calculateOverallScore(sentiment, pacing, voice),
      
      // Specific assessments
      audienceEngagement: this.assessAudienceEngagement(transcript, sentiment),
      messageClarity: this.assessMessageClarity(transcript, pacing),
      professionalPresence: this.assessProfessionalPresence(transcript, sentiment),
      
      // Presentation-specific feedback
      structureQuality: this.assessStructure(transcript, presentationType),
      
      // Comprehensive recommendations
      recommendations: this.getPublicSpeakingRecommendations(sentiment, pacing, voice, presentationType),
      
      // Individual component scores
      sentiment,
      pacing,
      voice
    }

    return publicSpeakingAnalysis
  }

  // Helper methods
  calculateEnergyLevel(transcript, positiveWords) {
    const exclamations = (transcript.match(/!/g) || []).length
    const capsWords = (transcript.match(/\b[A-Z]{2,}\b/g) || []).length
    const energyScore = positiveWords + exclamations + capsWords
    
    if (energyScore > 5) return 'high'
    if (energyScore > 2) return 'moderate'
    return 'low'
  }

  estimatePauses(transcript) {
    // Estimate pauses based on punctuation and sentence structure
    const commas = (transcript.match(/,/g) || []).length
    const periods = (transcript.match(/\./g) || []).length
    const dashes = (transcript.match(/[-—]/g) || []).length
    
    const shortPauses = commas // Comma pauses
    const mediumPauses = dashes // Dash pauses
    const longPauses = periods // Sentence end pauses
    
    return {
      total: shortPauses + mediumPauses + longPauses,
      distribution: {
        short: shortPauses,
        medium: mediumPauses,
        long: longPauses
      },
      averageLength: 1.2 // Estimated average pause length in seconds
    }
  }

  assessPacingQuality(wordCount, duration) {
    const wpm = (wordCount / duration) * 60
    
    if (wpm < 100) return { quality: 'slow', score: 60, message: 'Speaking pace is quite slow' }
    if (wpm < 130) return { quality: 'good', score: 90, message: 'Excellent speaking pace' }
    if (wpm < 160) return { quality: 'moderate', score: 75, message: 'Slightly fast but manageable' }
    return { quality: 'fast', score: 50, message: 'Speaking too quickly' }
  }

  estimateClarity(transcript, confidence) {
    // Base clarity on recognition confidence and word complexity
    const complexWords = transcript.split(/\s+/).filter(word => word.length > 8).length
    const totalWords = transcript.split(/\s+/).length
    const complexityRatio = complexWords / totalWords
    
    // Higher complexity with good recognition suggests clear articulation
    return Math.min(100, confidence + (complexityRatio * 20))
  }

  estimateArticulation(transcript) {
    // Estimate based on word variety and sentence structure
    const words = transcript.split(/\s+/)
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
    const varietyScore = (uniqueWords / words.length) * 100
    
    return Math.min(100, varietyScore * 1.2)
  }

  estimateVoiceVariation(transcript) {
    // Estimate based on sentence length variation and punctuation variety
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const lengths = sentences.map(s => s.split(/\s+/).length)
    
    if (lengths.length < 2) return 70
    
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length
    
    return Math.min(100, 50 + (variance * 2))
  }

  estimateProjection(transcript) {
    // Estimate based on confident language and sentence structure
    const confidenceWords = this.sentimentKeywords.confidence
    const words = transcript.toLowerCase().split(/\s+/)
    const confidenceCount = words.filter(word => confidenceWords.includes(word)).length
    
    return Math.min(100, 60 + (confidenceCount * 10))
  }

  calculateOverallScore(sentiment, pacing, voice) {
    return Math.round(
      (sentiment.confidenceLevel * 0.3) +
      (pacing.pacingQuality.score * 0.3) +
      (voice.overallQuality * 0.4)
    )
  }

  assessAudienceEngagement(transcript, sentiment) {
    const questions = (transcript.match(/\?/g) || []).length
    const directAddress = (transcript.match(/\b(you|your|we|us|our)\b/gi) || []).length
    const stories = (transcript.match(/\b(story|example|imagine|picture)\b/gi) || []).length
    
    const engagementScore = Math.min(100, 
      (questions * 10) + 
      (directAddress * 2) + 
      (stories * 15) + 
      sentiment.energyLevel === 'high' ? 20 : 0
    )

    return {
      score: engagementScore,
      techniques: {
        questions,
        directAddress,
        stories
      },
      level: engagementScore > 70 ? 'high' : engagementScore > 40 ? 'moderate' : 'low'
    }
  }

  assessMessageClarity(transcript, pacing) {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
    
    // Ideal sentence length is 15-20 words
    const lengthScore = avgSentenceLength > 25 ? 60 : avgSentenceLength < 10 ? 70 : 90
    const pacingScore = pacing.pacingQuality.score
    
    return {
      score: Math.round((lengthScore + pacingScore) / 2),
      avgSentenceLength: Math.round(avgSentenceLength),
      clarity: lengthScore > 80 && pacingScore > 80 ? 'excellent' : 'good'
    }
  }

  assessProfessionalPresence(transcript, sentiment) {
    const fillerWords = (transcript.match(/\b(um|uh|like|you know|sort of|kind of)\b/gi) || []).length
    const totalWords = transcript.split(/\s+/).length
    const fillerRatio = (fillerWords / totalWords) * 100
    
    const presenceScore = Math.max(0, 100 - (fillerRatio * 10) + sentiment.confidenceLevel * 0.3)
    
    return {
      score: Math.round(presenceScore),
      fillerWords,
      fillerRatio: Math.round(fillerRatio * 10) / 10,
      level: presenceScore > 80 ? 'strong' : presenceScore > 60 ? 'moderate' : 'needs work'
    }
  }

  assessStructure(transcript, presentationType) {
    // Basic structure assessment based on transition words and organization
    const transitions = (transcript.match(/\b(first|second|third|next|then|finally|in conclusion|however|therefore|furthermore)\b/gi) || []).length
    const totalSentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    const structureScore = Math.min(100, (transitions / totalSentences) * 200 + 50)
    
    return {
      score: Math.round(structureScore),
      transitions,
      organization: structureScore > 75 ? 'well-organized' : structureScore > 50 ? 'moderately organized' : 'needs structure'
    }
  }

  // Recommendation generators
  getSentimentRecommendations(scores, totalWords) {
    const recommendations = []
    
    if (scores.positive < 2) {
      recommendations.push("Try incorporating more positive language to engage your audience")
    }
    
    if (scores.uncertainty > scores.confidence) {
      recommendations.push("Use more definitive language to sound more confident")
    }
    
    if (scores.negative > scores.positive) {
      recommendations.push("Balance negative points with positive solutions or outcomes")
    }
    
    return recommendations
  }

  getPacingRecommendations(wordCount, duration, pauses) {
    const wpm = (wordCount / duration) * 60
    const recommendations = []
    
    if (wpm < 100) {
      recommendations.push("Try speaking slightly faster to maintain audience engagement")
    } else if (wpm > 160) {
      recommendations.push("Slow down your pace to ensure clarity and comprehension")
    }
    
    if (pauses.total < wordCount / 20) {
      recommendations.push("Add more strategic pauses to emphasize key points")
    }
    
    return recommendations
  }

  getVoiceRecommendations(voiceAnalysis) {
    const recommendations = []
    
    if (voiceAnalysis.clarity < 80) {
      recommendations.push("Focus on clear articulation and pronunciation")
    }
    
    if (voiceAnalysis.variation < 70) {
      recommendations.push("Vary your tone and pitch to keep listeners engaged")
    }
    
    if (voiceAnalysis.projection < 75) {
      recommendations.push("Speak with more confidence and authority")
    }
    
    return recommendations
  }

  getPublicSpeakingRecommendations(sentiment, pacing, voice, presentationType) {
    const recommendations = []
    
    // Combine all individual recommendations
    recommendations.push(...sentiment.recommendations)
    recommendations.push(...pacing.recommendations)
    recommendations.push(...voice.recommendations)
    
    // Add presentation-type specific recommendations
    if (presentationType === 'pitch') {
      recommendations.push("End with a clear call to action")
      recommendations.push("Use confident, assertive language throughout")
    } else if (presentationType === 'speech') {
      recommendations.push("Include personal stories to connect with your audience")
      recommendations.push("Use rhetorical devices for memorable impact")
    }
    
    return [...new Set(recommendations)] // Remove duplicates
  }
}

// Export singleton instance
export const advancedSpeechAnalyzer = new AdvancedSpeechAnalyzer()
export default advancedSpeechAnalyzer