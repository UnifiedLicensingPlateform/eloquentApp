import { useState, useRef, useEffect } from 'react'
import { Play, Square, Clock, Users, Mic, TrendingUp, Volume2, Heart } from 'lucide-react'

export default function PresentationPractice() {
  const [isRecording, setIsRecording] = useState(false)
  const [presentationMode, setPresentationMode] = useState('pitch') // pitch, meeting, speech, interview
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes default
  const [transcript, setTranscript] = useState('')
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null)
  const [pauseDetection, setPauseDetection] = useState([])
  const [sentimentData, setSentimentData] = useState(null)

  const presentationTypes = {
    pitch: {
      title: "🚀 Business Pitch",
      duration: 300, // 5 minutes
      structure: [
        { phase: "Hook", time: 30, description: "Grab attention with a compelling opening" },
        { phase: "Problem", time: 60, description: "Define the problem you're solving" },
        { phase: "Solution", time: 90, description: "Present your solution" },
        { phase: "Market", time: 60, description: "Show market opportunity" },
        { phase: "Close", time: 60, description: "Strong call to action" }
      ],
      tips: [
        "Start with a surprising statistic or question",
        "Use confident, assertive language",
        "Maintain steady pace - not too fast",
        "End with clear next steps"
      ]
    },
    meeting: {
      title: "💼 Team Meeting",
      duration: 180, // 3 minutes
      structure: [
        { phase: "Opening", time: 30, description: "Welcome and agenda overview" },
        { phase: "Updates", time: 90, description: "Share key updates or progress" },
        { phase: "Discussion", time: 45, description: "Address questions or concerns" },
        { phase: "Action Items", time: 15, description: "Summarize next steps" }
      ],
      tips: [
        "Speak clearly and professionally",
        "Use inclusive language",
        "Pause for questions",
        "Summarize key decisions"
      ]
    },
    speech: {
      title: "🎤 Public Speech",
      duration: 600, // 10 minutes
      structure: [
        { phase: "Introduction", time: 60, description: "Introduce yourself and topic" },
        { phase: "Main Point 1", time: 180, description: "First key message with examples" },
        { phase: "Main Point 2", time: 180, description: "Second key message with stories" },
        { phase: "Main Point 3", time: 120, description: "Third key message with data" },
        { phase: "Conclusion", time: 60, description: "Memorable closing and call to action" }
      ],
      tips: [
        "Use storytelling to connect emotionally",
        "Vary your pace and volume",
        "Include strategic pauses",
        "End with inspiration"
      ]
    },
    interview: {
      title: "👔 Job Interview",
      duration: 120, // 2 minutes per answer
      structure: [
        { phase: "Introduction", time: 30, description: "Brief personal introduction" },
        { phase: "Experience", time: 45, description: "Relevant experience and skills" },
        { phase: "Achievement", time: 30, description: "Specific accomplishment" },
        { phase: "Fit", time: 15, description: "Why you're perfect for this role" }
      ],
      tips: [
        "Be concise and specific",
        "Use STAR method (Situation, Task, Action, Result)",
        "Show enthusiasm and confidence",
        "End with a question"
      ]
    },
    wedding: {
      title: "💕 Wedding Speech",
      duration: 240, // 4 minutes
      structure: [
        { phase: "Opening", time: 30, description: "Warm greeting and introduce yourself" },
        { phase: "Story/Memory", time: 90, description: "Share a meaningful story about the couple" },
        { phase: "Qualities", time: 60, description: "Highlight what makes them special" },
        { phase: "Wishes", time: 45, description: "Express hopes for their future" },
        { phase: "Toast", time: 15, description: "Invite everyone to raise their glass" }
      ],
      tips: [
        "Speak from the heart with genuine emotion",
        "Keep it appropriate for all ages",
        "Practice emotional control - it's okay to pause",
        "End with a memorable toast"
      ],
      emotionalGuidance: {
        targetEmotion: "warm-joyful",
        confidenceLevel: "intimate-confident",
        energyLevel: "moderate-to-high",
        paceGuidance: "slower-for-emotion"
      }
    },
    bestman: {
      title: "🤵 Best Man Speech",
      duration: 300, // 5 minutes
      structure: [
        { phase: "Introduction", time: 30, description: "Introduce yourself and your relationship" },
        { phase: "Groom Story", time: 90, description: "Funny/heartwarming story about the groom" },
        { phase: "Meeting Partner", time: 60, description: "How the groom changed when they met" },
        { phase: "Couple Together", time: 75, description: "What makes them perfect together" },
        { phase: "Toast & Wishes", time: 45, description: "Future wishes and final toast" }
      ],
      tips: [
        "Balance humor with heartfelt moments",
        "Avoid embarrassing stories",
        "Include the partner in your stories",
        "Practice the emotional parts"
      ],
      emotionalGuidance: {
        targetEmotion: "humorous-heartfelt",
        confidenceLevel: "playful-confident",
        energyLevel: "high-with-pauses",
        paceGuidance: "vary-for-impact"
      }
    },
    maidofhonor: {
      title: "👰 Maid of Honor Speech",
      duration: 300, // 5 minutes
      structure: [
        { phase: "Introduction", time: 30, description: "Introduce yourself and your friendship" },
        { phase: "Friendship Story", time: 90, description: "Share your favorite memory together" },
        { phase: "Partner Impact", time: 60, description: "How their partner makes them glow" },
        { phase: "Love & Support", time: 75, description: "Express your love and support" },
        { phase: "Toast", time: 45, description: "Beautiful wishes and toast" }
      ],
      tips: [
        "Focus on the emotional connection",
        "Share what makes your friendship special",
        "Celebrate their love story",
        "Don't be afraid to show emotion"
      ],
      emotionalGuidance: {
        targetEmotion: "loving-celebratory",
        confidenceLevel: "intimate-strong",
        energyLevel: "warm-building",
        paceGuidance: "emotional-pauses"
      }
    },
    anniversary: {
      title: "💖 Anniversary Toast",
      duration: 120, // 2 minutes
      structure: [
        { phase: "Acknowledgment", time: 20, description: "Acknowledge the milestone" },
        { phase: "Journey", time: 40, description: "Reflect on their journey together" },
        { phase: "Admiration", time: 40, description: "Express what you admire about them" },
        { phase: "Future", time: 20, description: "Wishes for years to come" }
      ],
      tips: [
        "Keep it concise but meaningful",
        "Focus on their enduring love",
        "Mention specific qualities you admire",
        "End with hope for the future"
      ],
      emotionalGuidance: {
        targetEmotion: "reverent-joyful",
        confidenceLevel: "respectful-warm",
        energyLevel: "steady-building",
        paceGuidance: "measured-thoughtful"
      }
    },
    eulogy: {
      title: "🕊️ Memorial Speech",
      duration: 360, // 6 minutes
      structure: [
        { phase: "Opening", time: 45, description: "Gentle introduction and gratitude" },
        { phase: "Life Celebration", time: 120, description: "Share meaningful memories and stories" },
        { phase: "Legacy", time: 90, description: "Highlight their impact and values" },
        { phase: "Comfort", time: 60, description: "Offer comfort and hope" },
        { phase: "Farewell", time: 45, description: "Loving farewell and final thoughts" }
      ],
      tips: [
        "Speak slowly and clearly",
        "Focus on celebrating their life",
        "Share specific, meaningful memories",
        "Offer comfort to those grieving"
      ],
      emotionalGuidance: {
        targetEmotion: "respectful-comforting",
        confidenceLevel: "gentle-steady",
        energyLevel: "calm-supportive",
        paceGuidance: "slow-deliberate"
      }
    }
  }

  const getCurrentPhase = () => {
    const elapsed = presentationTypes[presentationMode].duration - timeLeft
    const structure = presentationTypes[presentationMode].structure
    let currentTime = 0
    
    for (let phase of structure) {
      currentTime += phase.time
      if (elapsed <= currentTime) {
        return phase
      }
    }
    return structure[structure.length - 1]
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Simulated real-time analysis (in real app, this would use actual audio analysis)
  const simulateRealTimeAnalysis = () => {
    const wordCount = transcript.split(' ').filter(word => word.length > 0).length
    const speakingRate = wordCount > 0 ? (wordCount / ((presentationTypes[presentationMode].duration - timeLeft) / 60)) : 0
    
    setRealTimeAnalysis({
      wordCount,
      speakingRate: Math.round(speakingRate),
      estimatedPauses: Math.floor(wordCount / 15), // Rough estimate
      confidenceLevel: Math.min(100, 60 + (wordCount * 0.5)), // Increases with more words
      energyLevel: speakingRate > 160 ? 'high' : speakingRate > 120 ? 'moderate' : 'low'
    })
  }

  useEffect(() => {
    if (isRecording && transcript) {
      simulateRealTimeAnalysis()
    }
  }, [transcript, timeLeft])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-6">🎤 Presentation Practice Studio</h2>
        
        {/* Presentation Type Selection */}
        {!isRecording && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Choose Your Speaking Scenario:</h3>
            
            {/* Professional Category */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">💼 Professional & Business</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['pitch', 'meeting', 'speech', 'interview'].map((key) => {
                  const type = presentationTypes[key]
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setPresentationMode(key)
                        setTimeLeft(type.duration)
                      }}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        presentationMode === key
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{type.title}</div>
                      <div className="text-xs text-gray-600">{formatTime(type.duration)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Wedding & Special Events Category */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">💕 Wedding & Special Events</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['wedding', 'bestman', 'maidofhonor', 'anniversary', 'eulogy'].map((key) => {
                  const type = presentationTypes[key]
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setPresentationMode(key)
                        setTimeLeft(type.duration)
                      }}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 relative ${
                        presentationMode === key
                          ? 'border-pink-500 bg-pink-50 shadow-lg'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {['wedding', 'bestman', 'maidofhonor'].includes(key) && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          NEW
                        </div>
                      )}
                      <div className="text-sm font-medium mb-1">{type.title}</div>
                      <div className="text-xs text-gray-600">{formatTime(type.duration)}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Current Presentation Structure */}
        {!isRecording && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
            <h4 className="font-semibold text-purple-900 mb-3">
              📋 {presentationTypes[presentationMode].title} Structure:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presentationTypes[presentationMode].structure.map((phase, index) => (
                <div key={index} className="bg-white/70 p-3 rounded-lg">
                  <div className="font-medium text-sm text-purple-800">{phase.phase}</div>
                  <div className="text-xs text-purple-600 mb-1">{formatTime(phase.time)}</div>
                  <div className="text-xs text-gray-600">{phase.description}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <h5 className="font-medium text-sm text-purple-900 mb-2">💡 Pro Tips:</h5>
              <ul className="text-xs text-purple-800 space-y-1">
                {presentationTypes[presentationMode].tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recording Interface */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono text-purple-600 mb-4">
            {formatTime(timeLeft)}
          </div>
          
          {!isRecording ? (
            <button
              onClick={() => setIsRecording(true)}
              className="btn-gradient inline-flex items-center px-8 py-4 rounded-2xl text-white font-semibold text-lg"
            >
              <Play className="w-6 h-6 mr-3" />
              Start {presentationTypes[presentationMode].title}
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(false)}
              className="bg-red-500 hover:bg-red-600 inline-flex items-center px-8 py-4 rounded-2xl text-white font-semibold text-lg"
            >
              <Square className="w-6 h-6 mr-3" />
              Stop Recording
            </button>
          )}
        </div>

        {/* Current Phase Indicator */}
        {isRecording && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900">Current Phase:</h4>
              <div className="text-sm text-green-700">
                {Math.round(((presentationTypes[presentationMode].duration - timeLeft) / presentationTypes[presentationMode].duration) * 100)}% Complete
              </div>
            </div>
            <div className="text-lg font-bold text-green-800 mb-1">{getCurrentPhase().phase}</div>
            <div className="text-sm text-green-700">{getCurrentPhase().description}</div>
            
            {/* Emotional Guidance for Wedding Speeches */}
            {['wedding', 'bestman', 'maidofhonor', 'anniversary', 'eulogy'].includes(presentationMode) && (
              <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-xs font-medium text-pink-800 mb-1">💕 EMOTIONAL GUIDANCE:</div>
                <div className="text-sm text-pink-700">
                  {presentationMode === 'wedding' && "Speak with warmth and genuine joy. Let your love for them shine through."}
                  {presentationMode === 'bestman' && "Balance humor with heartfelt emotion. It's okay to pause if you get emotional."}
                  {presentationMode === 'maidofhonor' && "Share from your heart. Your friendship is beautiful - let that emotion flow."}
                  {presentationMode === 'anniversary' && "Speak with reverence for their journey. Celebrate their enduring love."}
                  {presentationMode === 'eulogy' && "Speak slowly and gently. Focus on celebrating their life and offering comfort."}
                </div>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((presentationTypes[presentationMode].duration - timeLeft) / presentationTypes[presentationMode].duration) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Real-time Analysis */}
        {isRecording && realTimeAnalysis && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{realTimeAnalysis.wordCount}</div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{realTimeAnalysis.speakingRate}</div>
              <div className="text-xs text-gray-600">WPM</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{realTimeAnalysis.estimatedPauses}</div>
              <div className="text-xs text-gray-600">Pauses</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{realTimeAnalysis.confidenceLevel}%</div>
              <div className="text-xs text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className={`text-2xl font-bold ${
                realTimeAnalysis.energyLevel === 'high' ? 'text-red-600' :
                realTimeAnalysis.energyLevel === 'moderate' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {realTimeAnalysis.energyLevel === 'high' ? '🔥' : 
                 realTimeAnalysis.energyLevel === 'moderate' ? '⚡' : '😌'}
              </div>
              <div className="text-xs text-gray-600">Energy</div>
            </div>
          </div>
        )}

        {/* Live Transcript */}
        <div className="glass-dark rounded-xl p-4 min-h-32">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            Live Transcript:
          </h3>
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {transcript || (
              <span className="text-gray-500 italic">
                {isRecording ? 'Start speaking...' : 'Click start to begin your presentation practice'}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}