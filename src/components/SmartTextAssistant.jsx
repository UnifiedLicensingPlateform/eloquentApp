import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Wand2, Copy, Check, AlertCircle, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react'
import { geminiService } from '../services/geminiService'
import { detectWordRepetition } from '../utils/speechAnalysis'
import { useLanguage } from '../hooks/useLanguage.jsx'

export default function SmartTextAssistant() {
  const [originalText, setOriginalText] = useState('')
  const [improvedText, setImprovedText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null)
  
  // Voice dictation states
  const [isListening, setIsListening] = useState(false)
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  
  const { t, currentLanguage } = useLanguage()
  
  const debounceTimer = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecognitionSupported(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = currentLanguage === 'en' ? 'en-US' : 
                       currentLanguage === 'es' ? 'es-ES' :
                       currentLanguage === 'fr' ? 'fr-FR' :
                       currentLanguage === 'ar' ? 'ar-SA' :
                       currentLanguage === 'ur' ? 'ur-PK' : 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        setVoiceError('')
      }
      
      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setOriginalText(prev => prev + (prev ? ' ' : '') + finalTranscript)
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setVoiceError(`Voice recognition error: ${event.error}`)
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [currentLanguage])

  // Real-time analysis as user types
  useEffect(() => {
    if (originalText.length > 10) {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      // Set new timer for real-time analysis
      debounceTimer.current = setTimeout(() => {
        analyzeTextRealTime(originalText)
      }, 1000) // 1 second delay after user stops typing
    } else {
      setRealTimeAnalysis(null)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [originalText])

  const analyzeTextRealTime = (text) => {
    const analysis = detectWordRepetition(text)
    setRealTimeAnalysis(analysis)
  }

  // Voice dictation functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setVoiceError('Failed to start voice recognition')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Text-to-speech for improved text
  const speakImprovedText = () => {
    if (!improvedText) return
    
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(improvedText)
      utterance.lang = currentLanguage === 'en' ? 'en-US' : 
                      currentLanguage === 'es' ? 'es-ES' :
                      currentLanguage === 'fr' ? 'fr-FR' :
                      currentLanguage === 'ar' ? 'ar-SA' :
                      currentLanguage === 'ur' ? 'ur-PK' : 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const improveText = async () => {
    if (!originalText.trim()) return

    setIsImproving(true)
    setIsAnalyzing(true)

    try {
      // First, analyze the text for repetition
      const repetitionAnalysis = detectWordRepetition(originalText)
      setAnalysis(repetitionAnalysis)

      // Then, use Gemini AI to improve the text
      const improved = await geminiService.improveText(originalText, currentLanguage, {
        reduceRepetition: true,
        enhanceVocabulary: true,
        maintainMeaning: true,
        improveFlow: true
      })

      setImprovedText(improved.improvedText || originalText)

    } catch (error) {
      console.error('Error improving text:', error)
      // Fallback: Basic repetition reduction
      const basicImprovement = basicTextImprovement(originalText)
      setImprovedText(basicImprovement)
    } finally {
      setIsImproving(false)
      setIsAnalyzing(false)
    }
  }

  const basicTextImprovement = (text) => {
    // Basic improvement logic as fallback
    const words = text.split(' ')
    const synonyms = {
      'good': ['excellent', 'great', 'wonderful', 'fantastic'],
      'bad': ['poor', 'terrible', 'awful', 'disappointing'],
      'big': ['large', 'huge', 'massive', 'enormous'],
      'small': ['tiny', 'little', 'compact', 'miniature'],
      'nice': ['pleasant', 'lovely', 'delightful', 'charming'],
      'very': ['extremely', 'incredibly', 'remarkably', 'exceptionally'],
      'really': ['truly', 'genuinely', 'absolutely', 'certainly']
    }

    const wordCount = {}
    const improvedWords = []

    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1

      // If word is repeated more than twice and has synonyms
      if (wordCount[cleanWord] > 2 && synonyms[cleanWord]) {
        const synonymList = synonyms[cleanWord]
        const synonym = synonymList[Math.floor(Math.random() * synonymList.length)]
        improvedWords.push(word.replace(cleanWord, synonym))
      } else {
        improvedWords.push(word)
      }
    })

    return improvedWords.join(' ')
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const getRepetitionSeverity = (rate) => {
    if (rate > 15) return { level: 'high', color: 'red', message: 'High repetition detected' }
    if (rate > 8) return { level: 'medium', color: 'yellow', message: 'Some repetition found' }
    if (rate > 3) return { level: 'low', color: 'blue', message: 'Minor repetition' }
    return { level: 'good', color: 'green', message: 'Good variety' }
  }

  const severity = realTimeAnalysis ? getRepetitionSeverity(realTimeAnalysis.repetitionRate) : null

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Text Assistant</h2>
            <p className="text-gray-600">Fix repetitive words and improve your writing in real-time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Text</h3>
            <div className="flex items-center space-x-2">
              {/* Voice Recognition Button */}
              {isRecognitionSupported && (
                <button
                  onClick={toggleListening}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  title={isListening ? 'Stop dictation' : 'Start voice dictation'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Dictate
                    </>
                  )}
                </button>
              )}
              
              {realTimeAnalysis && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  severity.color === 'red' ? 'bg-red-100 text-red-800' :
                  severity.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  severity.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {severity.message}
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Type, paste, or use voice dictation to add your text here..."
              className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                isListening ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            
            {/* Voice Status Indicator */}
            {isListening && (
              <div className="absolute top-2 right-2 flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                Listening...
              </div>
            )}
            
            {/* Voice Error */}
            {voiceError && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                {voiceError}
              </div>
            )}
          </div>

          {/* Real-time Analysis */}
          {realTimeAnalysis && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{realTimeAnalysis.totalWords}</div>
                  <div className="text-xs text-gray-600">Words</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{realTimeAnalysis.totalRepetitions}</div>
                  <div className="text-xs text-gray-600">Repetitions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{realTimeAnalysis.repetitionRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Repetition Rate</div>
                </div>
              </div>

              {realTimeAnalysis.repeatedWords.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Repeated words:</div>
                  <div className="flex flex-wrap gap-1">
                    {realTimeAnalysis.repeatedWords.slice(0, 5).map(([word, count]) => (
                      <span
                        key={word}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {word} ({count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={improveText}
            disabled={!originalText.trim() || isImproving}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImproving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Improving...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Improve Text
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Improved Text</h3>
            {improvedText && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={speakImprovedText}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  title="Listen to improved text"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Listen
                </button>
                <button
                  onClick={() => copyToClipboard(improvedText)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
            {improvedText ? (
              <div className="whitespace-pre-wrap text-gray-900">{improvedText}</div>
            ) : (
              <div className="text-gray-500 italic">
                Your improved text will appear here...
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Analysis Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Original repetition rate:</span>
                  <span className="font-medium ml-1">{analysis.repetitionRate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-blue-700">Words improved:</span>
                  <span className="font-medium ml-1">{analysis.totalRepetitions}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Features Info */}
      {!isRecognitionSupported && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">Voice dictation not supported</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Voice dictation requires a modern browser with speech recognition support (Chrome, Edge, Safari).
          </p>
        </div>
      )}

      {/* Usage Examples */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Perfect for:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-start">
            <MessageSquare className="w-5 h-5 text-blue-500 mr-3 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Messages & Emails</h4>
              <p className="text-sm text-gray-600">Professional communication without repetition</p>
            </div>
          </div>
          <div className="flex items-start">
            <Wand2 className="w-5 h-5 text-purple-500 mr-3 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Social Media Posts</h4>
              <p className="text-sm text-gray-600">Engaging content with varied vocabulary</p>
            </div>
          </div>
          <div className="flex items-start">
            <Sparkles className="w-5 h-5 text-green-500 mr-3 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Documents & Reports</h4>
              <p className="text-sm text-gray-600">Professional writing with better flow</p>
            </div>
          </div>
          <div className="flex items-start">
            <Mic className="w-5 h-5 text-red-500 mr-3 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Voice Dictation</h4>
              <p className="text-sm text-gray-600">Speak naturally and get improved text</p>
            </div>
          </div>
        </div>
        
        {isRecognitionSupported && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🎤 Voice Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Dictate" to start voice input</li>
              <li>• Speak naturally - your words will appear in real-time</li>
              <li>• Click "Listen" to hear your improved text read aloud</li>
              <li>• Supports multiple languages based on your selection</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}