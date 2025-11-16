import { useState, useEffect } from 'react'
import { Heart, Zap, Shield, TrendingUp, AlertTriangle, Smile, Frown, Meh } from 'lucide-react'

export default function EmotionalIntelligenceCoach({ transcript, isRecording, onFeedback }) {
  const [emotionalState, setEmotionalState] = useState(null)
  const [realTimeFeedback, setRealTimeFeedback] = useState([])
  const [confidenceLevel, setConfidenceLevel] = useState(50)
  const [energyLevel, setEnergyLevel] = useState('moderate')
  const [anxietyIndicators, setAnxietyIndicators] = useState([])

  // Emotional keywords and patterns
  const emotionalPatterns = {
    confidence: {
      high: ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'undoubtedly', 'precisely', 'exactly', 'guaranteed', 'confident', 'sure', 'positive'],
      low: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'probably', 'seems', 'appears', 'sort of', 'kind of', 'i think', 'i guess', 'not sure', 'uncertain']
    },
    energy: {
      high: ['excited', 'amazing', 'fantastic', 'incredible', 'awesome', 'brilliant', 'outstanding', 'excellent', 'thrilled', 'passionate', 'energetic'],
      low: ['tired', 'okay', 'fine', 'alright', 'whatever', 'boring', 'dull', 'slow', 'quiet', 'calm', 'peaceful']
    },
    anxiety: {
      indicators: ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'i mean', 'well', 'so', 'nervous', 'worried', 'scared', 'anxious'],
      repetitive: ['really really', 'very very', 'so so', 'like like', 'and and', 'the the']
    },
    positivity: {
      positive: ['love', 'great', 'wonderful', 'happy', 'joy', 'success', 'achievement', 'proud', 'grateful', 'blessed', 'fortunate', 'lucky'],
      negative: ['hate', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'disappointed', 'worried', 'stressed', 'difficult', 'problem', 'issue']
    }
  }

  // Real-time analysis as transcript updates
  useEffect(() => {
    if (transcript && transcript.length > 20) {
      analyzeEmotionalState(transcript)
    }
  }, [transcript])

  const analyzeEmotionalState = (text) => {
    const words = text.toLowerCase().split(/\s+/)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Analyze confidence level
    const confidence = analyzeConfidence(words)
    setConfidenceLevel(confidence.level)
    
    // Analyze energy level
    const energy = analyzeEnergy(words, text)
    setEnergyLevel(energy.level)
    
    // Detect anxiety indicators
    const anxiety = detectAnxiety(words, text)
    setAnxietyIndicators(anxiety.indicators)
    
    // Analyze overall emotional state
    const emotion = analyzeOverallEmotion(words, confidence, energy, anxiety)
    setEmotionalState(emotion)
    
    // Generate real-time feedback
    const feedback = generateRealTimeFeedback(confidence, energy, anxiety, emotion)
    setRealTimeFeedback(feedback)
    
    // Send feedback to parent component
    if (onFeedback) {
      onFeedback({
        confidence: confidence.level,
        energy: energy.level,
        anxiety: anxiety.score,
        emotion: emotion.primary,
        feedback: feedback
      })
    }
  }

  const analyzeConfidence = (words) => {
    const highConfidenceWords = words.filter(word => 
      emotionalPatterns.confidence.high.includes(word)
    ).length
    
    const lowConfidenceWords = words.filter(word => 
      emotionalPatterns.confidence.low.includes(word)
    ).length
    
    const confidenceScore = Math.max(0, Math.min(100, 
      50 + (highConfidenceWords * 8) - (lowConfidenceWords * 6)
    ))
    
    return {
      level: confidenceScore,
      high: highConfidenceWords,
      low: lowConfidenceWords,
      assessment: confidenceScore > 70 ? 'high' : confidenceScore > 40 ? 'moderate' : 'low'
    }
  }

  const analyzeEnergy = (words, text) => {
    const highEnergyWords = words.filter(word => 
      emotionalPatterns.energy.high.includes(word)
    ).length
    
    const lowEnergyWords = words.filter(word => 
      emotionalPatterns.energy.low.includes(word)
    ).length
    
    // Check for exclamation marks and caps
    const exclamations = (text.match(/!/g) || []).length
    const capsWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length
    
    const energyScore = highEnergyWords + (exclamations * 2) + capsWords - lowEnergyWords
    
    let level = 'moderate'
    if (energyScore > 3) level = 'high'
    else if (energyScore < -1) level = 'low'
    
    return {
      level,
      score: energyScore,
      indicators: {
        highEnergyWords,
        lowEnergyWords,
        exclamations,
        capsWords
      }
    }
  }

  const detectAnxiety = (words, text) => {
    const fillerWords = words.filter(word => 
      emotionalPatterns.anxiety.indicators.includes(word)
    ).length
    
    // Detect repetitive patterns
    const repetitivePatterns = emotionalPatterns.anxiety.repetitive.filter(pattern => 
      text.toLowerCase().includes(pattern)
    ).length
    
    // Calculate speaking pace (rough estimate)
    const wordsPerSentence = words.length / Math.max(1, text.split(/[.!?]+/).length - 1)
    const rapidSpeech = wordsPerSentence > 20 ? 1 : 0
    
    const anxietyScore = fillerWords + (repetitivePatterns * 2) + rapidSpeech
    
    const indicators = []
    if (fillerWords > words.length * 0.1) indicators.push('High filler word usage')
    if (repetitivePatterns > 0) indicators.push('Repetitive speech patterns')
    if (rapidSpeech) indicators.push('Rapid speech pace')
    
    return {
      score: anxietyScore,
      indicators,
      level: anxietyScore > 5 ? 'high' : anxietyScore > 2 ? 'moderate' : 'low'
    }
  }

  const analyzeOverallEmotion = (words, confidence, energy, anxiety) => {
    const positiveWords = words.filter(word => 
      emotionalPatterns.positivity.positive.includes(word)
    ).length
    
    const negativeWords = words.filter(word => 
      emotionalPatterns.positivity.negative.includes(word)
    ).length
    
    // Determine primary emotion
    let primary = 'neutral'
    let secondary = []
    
    if (confidence.level > 70 && energy.level === 'high') {
      primary = 'confident-energetic'
      secondary.push('enthusiastic', 'passionate')
    } else if (confidence.level > 70) {
      primary = 'confident'
      secondary.push('assured', 'certain')
    } else if (energy.level === 'high') {
      primary = 'energetic'
      secondary.push('excited', 'animated')
    } else if (anxiety.score > 3) {
      primary = 'anxious'
      secondary.push('nervous', 'uncertain')
    } else if (positiveWords > negativeWords) {
      primary = 'positive'
      secondary.push('optimistic', 'upbeat')
    } else if (negativeWords > positiveWords) {
      primary = 'concerned'
      secondary.push('serious', 'thoughtful')
    }
    
    return {
      primary,
      secondary,
      positivity: positiveWords - negativeWords,
      overall: confidence.level + (energy.level === 'high' ? 20 : energy.level === 'low' ? -10 : 0) - anxiety.score
    }
  }

  const generateRealTimeFeedback = (confidence, energy, anxiety, emotion) => {
    const feedback = []
    
    // Confidence feedback
    if (confidence.level > 80) {
      feedback.push({ type: 'positive', message: '🌟 You sound very confident!', category: 'confidence' })
    } else if (confidence.level < 30) {
      feedback.push({ type: 'suggestion', message: '💪 Try using more definitive language', category: 'confidence' })
    }
    
    // Energy feedback
    if (energy.level === 'high') {
      feedback.push({ type: 'positive', message: '⚡ Great energy! Your enthusiasm is contagious', category: 'energy' })
    } else if (energy.level === 'low') {
      feedback.push({ type: 'suggestion', message: '🔥 Try adding more enthusiasm to engage your audience', category: 'energy' })
    }
    
    // Anxiety feedback
    if (anxiety.score > 4) {
      feedback.push({ type: 'calming', message: '🧘 Take a deep breath. Slow down and speak clearly', category: 'anxiety' })
    } else if (anxiety.score < 2) {
      feedback.push({ type: 'positive', message: '😌 You sound calm and composed', category: 'anxiety' })
    }
    
    // Overall emotion feedback
    if (emotion.primary === 'confident-energetic') {
      feedback.push({ type: 'excellent', message: '🚀 Perfect! Confident and energetic delivery', category: 'overall' })
    } else if (emotion.primary === 'anxious') {
      feedback.push({ type: 'calming', message: '💙 Remember to breathe. You\'ve got this!', category: 'overall' })
    }
    
    return feedback.slice(0, 3) // Limit to 3 most important pieces of feedback
  }

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'confident-energetic': return '🚀'
      case 'confident': return '💪'
      case 'energetic': return '⚡'
      case 'anxious': return '😰'
      case 'positive': return '😊'
      case 'concerned': return '🤔'
      default: return '😐'
    }
  }

  const getConfidenceColor = (level) => {
    if (level > 70) return 'text-green-600'
    if (level > 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEnergyColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500'
      case 'moderate': return 'text-blue-500'
      case 'low': return 'text-gray-500'
      default: return 'text-blue-500'
    }
  }

  if (!isRecording || !transcript) {
    return null
  }

  return (
    <div className="glass rounded-2xl p-4 mb-4 animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text flex items-center">
          <Heart className="w-5 h-5 mr-2 text-pink-500" />
          Emotional Intelligence Coach
        </h3>
        <div className="text-2xl">
          {emotionalState && getEmotionIcon(emotionalState.primary)}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white/50 rounded-xl">
          <div className={`text-2xl font-bold ${getConfidenceColor(confidenceLevel)}`}>
            {confidenceLevel}%
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Confidence
          </div>
        </div>

        <div className="text-center p-3 bg-white/50 rounded-xl">
          <div className={`text-2xl font-bold ${getEnergyColor(energyLevel)}`}>
            {energyLevel === 'high' ? '🔥' : energyLevel === 'moderate' ? '⚡' : '😌'}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <Zap className="w-3 h-3 mr-1" />
            Energy
          </div>
        </div>

        <div className="text-center p-3 bg-white/50 rounded-xl">
          <div className={`text-2xl font-bold ${
            anxietyIndicators.length > 2 ? 'text-red-600' : 
            anxietyIndicators.length > 0 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {anxietyIndicators.length > 2 ? '😰' : anxietyIndicators.length > 0 ? '😐' : '😌'}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Calm
          </div>
        </div>
      </div>

      {/* Real-time Feedback */}
      {realTimeFeedback.length > 0 && (
        <div className="space-y-2">
          {realTimeFeedback.map((feedback, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm animate-slideInRight ${
                feedback.type === 'positive' ? 'bg-green-50 text-green-800 border border-green-200' :
                feedback.type === 'excellent' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                feedback.type === 'suggestion' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                feedback.type === 'calming' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                'bg-gray-50 text-gray-800 border border-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {feedback.message}
            </div>
          ))}
        </div>
      )}

      {/* Anxiety Indicators */}
      {anxietyIndicators.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-900 mb-2">🧘 Calming Tips:</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            {anxietyIndicators.includes('High filler word usage') && (
              <li>• Pause instead of using filler words like "um" and "uh"</li>
            )}
            {anxietyIndicators.includes('Repetitive speech patterns') && (
              <li>• Take a breath and organize your thoughts before speaking</li>
            )}
            {anxietyIndicators.includes('Rapid speech pace') && (
              <li>• Slow down your pace - your audience wants to understand you</li>
            )}
          </ul>
        </div>
      )}

      {/* Current Emotional State */}
      {emotionalState && (
        <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-pink-900">
                Current State: <span className="capitalize">{emotionalState.primary.replace('-', ' & ')}</span>
              </div>
              {emotionalState.secondary.length > 0 && (
                <div className="text-xs text-pink-700 mt-1">
                  Also: {emotionalState.secondary.join(', ')}
                </div>
              )}
            </div>
            <div className="text-2xl">
              {getEmotionIcon(emotionalState.primary)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}