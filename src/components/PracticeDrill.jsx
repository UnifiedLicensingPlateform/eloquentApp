import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Square } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { detectWordRepetition } from '../utils/speechAnalysis'
import { useUsageTracking } from '../hooks/useUsageTracking'
import UsageLimits from './UsageLimits'
import EmotionalIntelligenceCoach from './EmotionalIntelligenceCoach'
import { advancedSpeechAnalyzer } from '../utils/advancedSpeechAnalysis'

export default function PracticeDrill() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [repetitionData, setRepetitionData] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [practiceMode, setPracticeMode] = useState('free') // 'free', 'guided', 'structured'
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [emotionalFeedback, setEmotionalFeedback] = useState(null)
  const [recordingStartTime, setRecordingStartTime] = useState(null)
  
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const { usage, subscription, planFeatures, incrementUsage, checkCanCreateSession } = useUsageTracking()

  useEffect(() => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      stopDrill()
    }
    
    return () => clearTimeout(timerRef.current)
  }, [isActive, timeLeft])

  const startDrill = async () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    // Check usage limits for free users
    if (!usage.canCreateSession) {
      alert('You\'ve reached your monthly limit of practice sessions. Upgrade to Pro for unlimited sessions!')
      return
    }

    const canCreate = await checkCanCreateSession()
    if (!canCreate) {
      alert('You\'ve reached your monthly limit of practice sessions. Upgrade to Pro for unlimited sessions!')
      return
    }

    setIsActive(true)
    setIsRecording(true)
    setTranscript('')
    setTimeLeft(60)
    setRepetitionData(null)
    setRecordingStartTime(Date.now())
    
    recognitionRef.current.start()
  }

  const stopDrill = async () => {
    setIsActive(false)
    setIsRecording(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Analyze the transcript for word repetition
    if (transcript.trim()) {
      const analysis = detectWordRepetition(transcript)
      setRepetitionData(analysis)
      
      // Save to Supabase and increment usage
      const saved = await savePracticeSession(transcript, analysis)
      if (saved) {
        await incrementUsage()
      }
    }
  }

  const savePracticeSession = async (transcript, analysis) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Perform EI analysis if user has access
      let eiData = {}
      if (usage.hasEIAccess && emotionalFeedback) {
        const duration = (Date.now() - recordingStartTime) / 1000 // seconds
        const advancedAnalysis = advancedSpeechAnalyzer.analyzePublicSpeaking(transcript, duration)
        
        eiData = {
          confidence_level: emotionalFeedback.confidence || 50,
          energy_level: emotionalFeedback.energy || 'moderate',
          anxiety_score: emotionalFeedback.anxiety || 0,
          positivity_score: advancedAnalysis.sentiment.positive || 50,
          emotional_tone: emotionalFeedback.emotion || 'neutral',
          filler_words_count: advancedAnalysis.sentiment.uncertainty || 0,
          speaking_pace: advancedAnalysis.pacing.wordsPerMinute || 0,
          voice_quality_score: advancedAnalysis.voice.overallQuality || 70,
          emotional_insights: {
            sentiment: advancedAnalysis.sentiment,
            pacing: advancedAnalysis.pacing,
            voice: advancedAnalysis.voice,
            recommendations: advancedAnalysis.recommendations
          }
        }
      }
      
      const { data: sessionData, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          transcript,
          word_count: analysis.totalWords,
          repetition_count: analysis.totalRepetitions,
          repetition_rate: analysis.repetitionRate,
          repeated_words: analysis.repeatedWords,
          fluency_score: Math.max(0, 100 - (analysis.repetitionRate * 10)),
          ...eiData
        })
        .select()
        .single()

      if (error) throw error

      // Store detailed EI analysis if user has access and EI data exists
      if (usage.hasEIAccess && emotionalFeedback && sessionData) {
        try {
          await supabase.rpc('store_emotional_intelligence_analysis', {
            p_practice_session_id: sessionData.id,
            p_user_id: user.id,
            p_confidence_level: emotionalFeedback.confidence || 50,
            p_energy_level: emotionalFeedback.energy || 'moderate',
            p_anxiety_score: emotionalFeedback.anxiety || 0,
            p_positivity_score: eiData.positivity_score || 50,
            p_emotional_tone: emotionalFeedback.emotion || 'neutral',
            p_analysis_data: eiData.emotional_insights || {}
          })
        } catch (eiError) {
          console.warn('Failed to store detailed EI analysis:', eiError)
          // Don't fail the entire session save if EI storage fails
        }
      }

      return true
    } catch (error) {
      console.error('Error saving practice session:', error)
      return false
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Practice topics and prompts
  const practiceTopics = {
    business: {
      title: "💼 Business & Professional",
      prompts: [
        "Describe your ideal work environment and what makes you productive",
        "Explain a challenging project you worked on and how you overcame obstacles",
        "Discuss the importance of teamwork in achieving business goals",
        "Describe your leadership style and how you motivate others",
        "Explain how technology has changed your industry"
      ]
    },
    personal: {
      title: "🌟 Personal Development",
      prompts: [
        "Describe a skill you'd like to learn and why it interests you",
        "Talk about a book, movie, or experience that changed your perspective",
        "Explain your daily routine and how it helps you stay organized",
        "Describe your biggest achievement and what you learned from it",
        "Discuss your goals for the next five years"
      ]
    },
    social: {
      title: "👥 Social & Relationships",
      prompts: [
        "Describe your best friend and what makes your friendship special",
        "Explain how you handle disagreements or conflicts with others",
        "Talk about a memorable celebration or gathering you attended",
        "Describe your family traditions and why they're important to you",
        "Explain how you make new friends or build professional relationships"
      ]
    },
    creative: {
      title: "🎨 Creative & Hobbies",
      prompts: [
        "Describe your favorite hobby and why you enjoy it",
        "Explain how you express your creativity in daily life",
        "Talk about a place you'd love to visit and what you'd do there",
        "Describe your perfect weekend and the activities you'd include",
        "Explain a creative project you're working on or would like to start"
      ]
    },
    academic: {
      title: "📚 Academic & Learning",
      prompts: [
        "Explain a complex topic you recently learned about",
        "Describe your preferred learning style and study methods",
        "Discuss the role of education in personal and professional growth",
        "Explain how you stay updated with current events and trends",
        "Describe a teacher or mentor who influenced your thinking"
      ]
    },
    storytelling: {
      title: "📖 Storytelling & Experiences",
      prompts: [
        "Tell the story of your most memorable travel experience",
        "Describe a time when you had to adapt to unexpected changes",
        "Share a funny or embarrassing moment and what you learned from it",
        "Tell about a time when you helped someone or received unexpected help",
        "Describe a challenge you faced and how you overcame it"
      ]
    }
  }

  const getRandomPrompt = (category) => {
    const prompts = practiceTopics[category]?.prompts || []
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  const selectTopic = (category) => {
    setSelectedTopic(category)
    setCurrentPrompt(getRandomPrompt(category))
    setPracticeMode('guided')
  }

  const handleEmotionalFeedback = (feedback) => {
    setEmotionalFeedback(feedback)
  }

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Browser Not Supported</h3>
          <p className="text-red-700">
            Speech recognition requires Chrome, Edge, or Safari. Please switch browsers to use this feature.
          </p>
        </div>
      </div>
    )
  }

  const handleUpgrade = () => {
    // Navigate to pricing page or open upgrade modal
    window.location.hash = '#pricing'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UsageLimits 
        sessionsUsed={usage.sessionsUsed}
        sessionsLimit={usage.sessionsLimit}
        plan={subscription?.plan_name || 'free'}
        onUpgrade={handleUpgrade}
      />

      {/* Practice Mode Selection */}
      {!isActive && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fadeInUp">
          <h2 className="text-2xl font-bold gradient-text mb-4">🎤 Choose Your Practice Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setPracticeMode('free')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                practiceMode === 'free'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="text-2xl mb-2">🗣️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Free Speaking</h3>
              <p className="text-sm text-gray-600">Speak about anything you want for 60 seconds</p>
            </button>

            <button
              onClick={() => setPracticeMode('guided')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                practiceMode === 'guided'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-semibold text-gray-900 mb-1">Guided Topics</h3>
              <p className="text-sm text-gray-600">Choose a topic and get speaking prompts</p>
            </button>

            <button
              onClick={() => setPracticeMode('structured')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                practiceMode === 'structured'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 mb-1">Structured Practice</h3>
              <p className="text-sm text-gray-600">Follow specific speaking exercises</p>
            </button>
          </div>

          {/* Topic Selection for Guided Mode */}
          {practiceMode === 'guided' && (
            <div className="animate-fadeInUp">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Select a Topic Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(practiceTopics).map(([key, topic]) => (
                  <button
                    key={key}
                    onClick={() => selectTopic(key)}
                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                      selectedTopic === key
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{topic.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Prompt Display */}
          {currentPrompt && practiceMode === 'guided' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 animate-fadeInUp">
              <h4 className="font-semibold text-purple-900 mb-2">💭 Your Speaking Prompt:</h4>
              <p className="text-purple-800 text-lg leading-relaxed">{currentPrompt}</p>
              <button
                onClick={() => setCurrentPrompt(getRandomPrompt(selectedTopic))}
                className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                🎲 Get Different Prompt
              </button>
            </div>
          )}

          {/* Structured Practice Instructions */}
          {practiceMode === 'structured' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 animate-fadeInUp">
              <h4 className="font-semibold text-green-900 mb-3">📋 Structured Speaking Exercise:</h4>
              <div className="space-y-2 text-green-800">
                <p><strong>0-15 seconds:</strong> Introduce your topic and main point</p>
                <p><strong>15-40 seconds:</strong> Provide 2-3 supporting details or examples</p>
                <p><strong>40-60 seconds:</strong> Conclude with a summary or personal reflection</p>
              </div>
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Today's Topic:</strong> "Describe something you learned recently and how it has impacted your daily life."
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {practiceMode === 'free' && '🗣️ Free Speaking Practice'}
            {practiceMode === 'guided' && '💡 Guided Topic Practice'}
            {practiceMode === 'structured' && '📋 Structured Speaking Exercise'}
          </h2>
          {!isActive && practiceMode !== 'free' && (
            <button
              onClick={() => {
                setPracticeMode('free')
                setSelectedTopic(null)
                setCurrentPrompt('')
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Mode Selection
            </button>
          )}
        </div>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-mono text-blue-600 mb-4">
            {formatTime(timeLeft)}
          </div>
          
          {!isActive ? (
            <button
              onClick={startDrill}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Play className="w-5 h-5 mr-2" />
              Start 60-Second Drill
            </button>
          ) : (
            <button
              onClick={stopDrill}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Drill
            </button>
          )}
        </div>

        {/* Current Prompt Reminder (during recording) */}
        {isActive && currentPrompt && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xs font-medium text-purple-600 mb-1">REMEMBER YOUR PROMPT:</div>
            <div className="text-sm text-purple-800">{currentPrompt}</div>
          </div>
        )}

        {/* Structured Practice Timer Guide */}
        {isActive && practiceMode === 'structured' && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs font-medium text-green-600 mb-1">CURRENT PHASE:</div>
            <div className="text-sm text-green-800">
              {timeLeft > 45 && "🎯 Introduce your topic and main point"}
              {timeLeft <= 45 && timeLeft > 20 && "📝 Provide supporting details and examples"}
              {timeLeft <= 20 && "🎬 Conclude with summary or reflection"}
            </div>
          </div>
        )}

        {/* Emotional Intelligence Coach */}
        <EmotionalIntelligenceCoach 
          transcript={transcript}
          isRecording={isRecording}
          onFeedback={handleEmotionalFeedback}
        />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {isRecording ? (
                <Mic className="w-5 h-5 text-red-500 mr-2 animate-pulse" />
              ) : (
                <MicOff className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isRecording ? 'Recording...' : 'Not recording'}
              </span>
            </div>
            
            {/* Word count during recording */}
            {isActive && transcript && (
              <div className="text-sm text-gray-600">
                Words: {transcript.split(' ').filter(word => word.length > 0).length}
              </div>
            )}
          </div>
          
          <div className="glass-dark rounded-lg p-4 min-h-32">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Live Transcript:</h3>
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {transcript || (
                <span className="text-gray-500 italic">
                  {practiceMode === 'free' && 'Start speaking about anything you want...'}
                  {practiceMode === 'guided' && 'Start speaking about your selected topic...'}
                  {practiceMode === 'structured' && 'Begin with introducing your topic...'}
                </span>
              )}
            </p>
          </div>
        </div>

        {repetitionData && (
          <div className="glass rounded-2xl p-6 animate-fadeInUp">
            <h3 className="text-xl font-bold gradient-text mb-4">📊 Your Performance Analysis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{repetitionData.totalWords}</div>
                <div className="text-sm text-gray-600 font-medium">Total Words</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-3xl font-bold text-red-600">{repetitionData.totalRepetitions}</div>
                <div className="text-sm text-gray-600 font-medium">Repetitions</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">{repetitionData.repetitionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 font-medium">Repetition Rate</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">
                  {Math.max(0, 100 - (repetitionData.repetitionRate * 10)).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Fluency Score</div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Performance Feedback:</h4>
              <div className="text-gray-700">
                {repetitionData.repetitionRate < 5 && (
                  <p className="text-green-700">🌟 Excellent! Your vocabulary variety is outstanding. Keep up the great work!</p>
                )}
                {repetitionData.repetitionRate >= 5 && repetitionData.repetitionRate < 10 && (
                  <p className="text-blue-700">👍 Good job! Your speech flows well with minimal repetition. Try to expand your vocabulary even more.</p>
                )}
                {repetitionData.repetitionRate >= 10 && repetitionData.repetitionRate < 15 && (
                  <p className="text-orange-700">💡 Not bad! Focus on using synonyms and varying your word choices to improve fluency.</p>
                )}
                {repetitionData.repetitionRate >= 15 && (
                  <p className="text-red-700">🎯 Room for improvement! Practice using different words to express the same ideas. Consider expanding your vocabulary.</p>
                )}
              </div>
            </div>

            {/* Emotional Intelligence Summary */}
            {emotionalFeedback && (
              <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                <h4 className="font-semibold text-pink-900 mb-3">🎭 Emotional Intelligence Analysis:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{emotionalFeedback.confidence}%</div>
                    <div className="text-xs text-gray-600">Confidence Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 capitalize">{emotionalFeedback.energy}</div>
                    <div className="text-xs text-gray-600">Energy Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 capitalize">{emotionalFeedback.emotion.replace('-', ' & ')}</div>
                    <div className="text-xs text-gray-600">Emotional State</div>
                  </div>
                </div>
                
                <div className="text-sm text-pink-800">
                  {emotionalFeedback.confidence > 70 && emotionalFeedback.energy === 'high' && (
                    <p>🚀 <strong>Outstanding!</strong> You delivered with high confidence and great energy. Your audience would be captivated!</p>
                  )}
                  {emotionalFeedback.confidence > 70 && emotionalFeedback.energy !== 'high' && (
                    <p>💪 <strong>Very confident delivery!</strong> You sound assured and credible. Consider adding more energy for even greater impact.</p>
                  )}
                  {emotionalFeedback.confidence <= 70 && emotionalFeedback.energy === 'high' && (
                    <p>⚡ <strong>Great energy!</strong> Your enthusiasm shines through. Work on using more definitive language to boost confidence.</p>
                  )}
                  {emotionalFeedback.confidence <= 50 && emotionalFeedback.anxiety > 3 && (
                    <p>🧘 <strong>Take a breath!</strong> You seem a bit nervous. Practice deep breathing and use more certain language. You've got this!</p>
                  )}
                  {emotionalFeedback.confidence > 50 && emotionalFeedback.confidence <= 70 && (
                    <p>👍 <strong>Good foundation!</strong> You're on the right track. Try using more assertive language to sound even more confident.</p>
                  )}
                </div>
              </div>
            )}

            {/* Mode-specific feedback */}
            {practiceMode === 'structured' && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">📋 Structure Analysis:</h4>
                <p className="text-green-800 text-sm">
                  Great job following the structured format! Your speech had a clear beginning, middle, and end. 
                  This helps listeners follow your thoughts more easily.
                </p>
              </div>
            )}

            {practiceMode === 'guided' && selectedTopic && (
              <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">💡 Topic Mastery:</h4>
                <p className="text-purple-800 text-sm">
                  You practiced with the <strong>{practiceTopics[selectedTopic]?.title}</strong> category. 
                  Having a focused topic helps organize your thoughts and improves coherence.
                </p>
              </div>
            )}
            
            {repetitionData.repeatedWords.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🔄 Words to Vary:</h4>
                <div className="flex flex-wrap gap-2">
                  {repetitionData.repeatedWords.slice(0, 10).map(([word, count]) => (
                    <span
                      key={word}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200"
                    >
                      {word} ({count}x)
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Try using synonyms for these words in your next practice session!
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setRepetitionData(null)
                  setTranscript('')
                  if (practiceMode === 'guided' && selectedTopic) {
                    setCurrentPrompt(getRandomPrompt(selectedTopic))
                  }
                }}
                className="btn-gradient px-4 py-2 rounded-xl text-white font-medium"
              >
                🔄 Practice Again
              </button>
              
              {practiceMode === 'guided' && (
                <button
                  onClick={() => {
                    setCurrentPrompt(getRandomPrompt(selectedTopic))
                    setRepetitionData(null)
                    setTranscript('')
                  }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
                >
                  🎲 New Topic
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}