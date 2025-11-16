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
            <h3 className="text-lg font-semibold mb-4">Choose Your Presentation Type:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(presentationTypes).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => {
                    setPresentationMode(key)
                    setTimeLeft(type.duration)
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    presentationMode === key
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-lg mb-2">{type.title}</div>
                  <div className="text-sm text-gray-600">{formatTime(type.duration)}</div>
                </button>
              ))}
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