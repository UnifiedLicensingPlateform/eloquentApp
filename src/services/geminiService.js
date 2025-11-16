// Gemini AI Service for speech analysis and insights
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY
  }

  async analyzeSpeechTranscript(transcript, language = 'en', analysisType = 'fluency') {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    const prompts = {
      fluency: this.getFluentAnalysisPrompt(transcript, language),
      grammar: this.getGrammarAnalysisPrompt(transcript, language),
      vocabulary: this.getVocabularyAnalysisPrompt(transcript, language),
      pronunciation: this.getPronunciationAnalysisPrompt(transcript, language)
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompts[analysisType] || prompts.fluency
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) {
        throw new Error('No response from Gemini AI')
      }

      return this.parseAIResponse(aiResponse, analysisType)

    } catch (error) {
      console.error('Gemini AI analysis error:', error)
      throw error
    }
  }

  getFluentAnalysisPrompt(transcript, language) {
    const languageNames = {
      'en': 'English',
      'ur': 'Urdu',
      'ar': 'Arabic',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'hi': 'Hindi',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    }

    return `Analyze this ${languageNames[language] || 'English'} speech transcript for fluency and provide structured feedback:

TRANSCRIPT: "${transcript}"

Please provide analysis in this JSON format:
{
  "fluencyScore": 85,
  "strengths": ["Clear articulation", "Good pace"],
  "weaknesses": ["Word repetition", "Filler words"],
  "suggestions": ["Practice varying vocabulary", "Slow down when speaking"],
  "repeatedWords": ["the", "and", "like"],
  "fillerWords": ["um", "uh", "like"],
  "overallAssessment": "Good fluency with room for improvement in vocabulary variety",
  "confidenceScore": 92
}

Focus on:
1. Speech fluency and flow
2. Word repetition patterns
3. Use of filler words
4. Vocabulary variety
5. Overall coherence

Respond only with valid JSON.`
  }

  getGrammarAnalysisPrompt(transcript, language) {
    const languageNames = {
      'en': 'English',
      'ur': 'Urdu',
      'ar': 'Arabic',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'hi': 'Hindi',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    }

    return `Analyze this ${languageNames[language] || 'English'} speech transcript for grammar and provide structured feedback:

TRANSCRIPT: "${transcript}"

Please provide analysis in this JSON format:
{
  "grammarScore": 78,
  "errors": [
    {"type": "subject-verb agreement", "example": "He don't like", "correction": "He doesn't like"},
    {"type": "tense consistency", "example": "I go yesterday", "correction": "I went yesterday"}
  ],
  "strengths": ["Correct sentence structure", "Good use of conjunctions"],
  "suggestions": ["Review verb tenses", "Practice subject-verb agreement"],
  "overallAssessment": "Generally good grammar with some common errors",
  "confidenceScore": 88
}

Focus on:
1. Grammar accuracy
2. Sentence structure
3. Verb tenses
4. Common grammatical errors
5. Language-specific grammar rules

Respond only with valid JSON.`
  }

  getVocabularyAnalysisPrompt(transcript, language) {
    return `Analyze this speech transcript for vocabulary usage and provide structured feedback:

TRANSCRIPT: "${transcript}"

Please provide analysis in this JSON format:
{
  "vocabularyScore": 82,
  "vocabularyLevel": "intermediate",
  "uniqueWords": 45,
  "totalWords": 120,
  "complexWords": ["sophisticated", "analyze", "comprehensive"],
  "simpleWords": ["good", "nice", "big"],
  "suggestions": ["Use more varied adjectives", "Incorporate advanced vocabulary"],
  "recommendedWords": ["excellent instead of good", "substantial instead of big"],
  "overallAssessment": "Good vocabulary range with opportunities for enhancement",
  "confidenceScore": 90
}

Focus on:
1. Vocabulary diversity
2. Word complexity level
3. Repetitive word usage
4. Opportunities for enhancement
5. Context-appropriate word choice

Respond only with valid JSON.`
  }

  getPronunciationAnalysisPrompt(transcript, language) {
    return `Based on this speech transcript, provide pronunciation guidance and feedback:

TRANSCRIPT: "${transcript}"

Please provide analysis in this JSON format:
{
  "pronunciationScore": 75,
  "potentialIssues": ["th sounds", "r pronunciation"],
  "strengths": ["Clear vowel sounds", "Good consonant clarity"],
  "suggestions": ["Practice 'th' sound exercises", "Work on rolling 'r' sounds"],
  "practiceWords": ["think", "three", "through", "red", "right"],
  "overallAssessment": "Generally clear pronunciation with specific areas for improvement",
  "confidenceScore": 85
}

Note: This analysis is based on transcript patterns and common pronunciation challenges.
Focus on:
1. Common pronunciation patterns
2. Potential sound difficulties
3. Practice recommendations
4. Clarity indicators from text

Respond only with valid JSON.`
  }

  parseAIResponse(response, analysisType) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsedResponse = JSON.parse(jsonMatch[0])
      
      // Add metadata
      return {
        ...parsedResponse,
        analysisType,
        timestamp: new Date().toISOString(),
        aiProvider: 'gemini-pro'
      }

    } catch (error) {
      console.error('Error parsing AI response:', error)
      // Return fallback response
      return {
        error: 'Failed to parse AI response',
        analysisType,
        timestamp: new Date().toISOString(),
        aiProvider: 'gemini-pro',
        confidenceScore: 0
      }
    }
  }

  async generateCustomTopics(language = 'en', difficulty = 'intermediate', category = 'general') {
    const prompt = `Generate 5 practice topics for speech improvement in ${language}. 
    Difficulty: ${difficulty}
    Category: ${category}

    Please provide response in this JSON format:
    {
      "topics": [
        {
          "title": "Topic title",
          "description": "Brief description",
          "prompts": ["Speaking prompt 1", "Speaking prompt 2", "Speaking prompt 3"],
          "difficulty": "${difficulty}",
          "estimatedTime": "2-3 minutes"
        }
      ]
    }

    Make topics engaging and relevant for speech practice. Respond only with valid JSON.`

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to generate topics')

    } catch (error) {
      console.error('Error generating custom topics:', error)
      return { topics: [] }
    }
  }

  async improveText(text, language = 'en', options = {}) {
    const {
      reduceRepetition = true,
      enhanceVocabulary = true,
      maintainMeaning = true,
      improveFlow = true,
      formalTone = false
    } = options

    const languageNames = {
      'en': 'English',
      'ur': 'Urdu',
      'ar': 'Arabic',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'hi': 'Hindi',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    }

    const prompt = `Improve this ${languageNames[language] || 'English'} text by reducing word repetition and enhancing vocabulary while maintaining the original meaning:

ORIGINAL TEXT: "${text}"

IMPROVEMENT GOALS:
${reduceRepetition ? '- Reduce word repetition by using synonyms and varied expressions' : ''}
${enhanceVocabulary ? '- Enhance vocabulary with more sophisticated words where appropriate' : ''}
${maintainMeaning ? '- Maintain the exact original meaning and intent' : ''}
${improveFlow ? '- Improve sentence flow and readability' : ''}
${formalTone ? '- Make the tone more formal and professional' : '- Keep the original tone and style'}

Please provide response in this JSON format:
{
  "improvedText": "The improved version of the text",
  "changes": [
    {"original": "good good", "improved": "excellent", "reason": "Reduced repetition"},
    {"original": "very big", "improved": "enormous", "reason": "Enhanced vocabulary"}
  ],
  "improvements": {
    "repetitionReduction": 85,
    "vocabularyEnhancement": 70,
    "readabilityScore": 90
  },
  "summary": "Reduced repetition by 85% and enhanced vocabulary while maintaining original meaning"
}

Focus on:
1. Identifying repeated words and phrases
2. Replacing with appropriate synonyms
3. Maintaining natural flow
4. Preserving the original message
5. Making it sound natural, not robotic

Respond only with valid JSON.`

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) {
        throw new Error('No response from Gemini AI')
      }

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          ...parsed,
          timestamp: new Date().toISOString(),
          aiProvider: 'gemini-pro',
          originalLength: text.length,
          improvedLength: parsed.improvedText?.length || 0
        }
      }

      throw new Error('Failed to parse improvement response')

    } catch (error) {
      console.error('Error improving text:', error)
      // Return fallback response
      return {
        improvedText: text,
        changes: [],
        improvements: {
          repetitionReduction: 0,
          vocabularyEnhancement: 0,
          readabilityScore: 50
        },
        summary: 'Unable to improve text at this time',
        error: error.message
      }
    }
  }

  async getPersonalizedInsights(userSessions, language = 'en') {
    const recentSessions = userSessions.slice(-5) // Last 5 sessions
    const sessionSummary = recentSessions.map(session => ({
      fluencyScore: session.fluency_score,
      repetitionRate: session.repetition_rate,
      wordCount: session.word_count,
      date: session.created_at
    }))

    const prompt = `Based on these speech practice sessions, provide personalized insights and recommendations:

    SESSION DATA: ${JSON.stringify(sessionSummary)}

    Please provide analysis in this JSON format:
    {
      "overallProgress": "improving/stable/declining",
      "keyStrengths": ["Consistent practice", "Improving fluency"],
      "areasForImprovement": ["Reduce word repetition", "Expand vocabulary"],
      "personalizedTips": ["Practice 10 minutes daily", "Focus on synonyms"],
      "motivationalMessage": "Great progress! Keep up the consistent practice.",
      "nextGoals": ["Achieve 90+ fluency score", "Reduce repetition to under 5%"],
      "confidenceScore": 88
    }

    Focus on:
    1. Progress trends
    2. Personalized recommendations
    3. Motivational insights
    4. Specific actionable goals

    Respond only with valid JSON.`

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to generate insights')

    } catch (error) {
      console.error('Error generating personalized insights:', error)
      return {
        overallProgress: 'stable',
        keyStrengths: ['Regular practice'],
        areasForImprovement: ['Continue practicing'],
        personalizedTips: ['Keep up the good work'],
        motivationalMessage: 'Every practice session helps you improve!',
        nextGoals: ['Continue regular practice'],
        confidenceScore: 50
      }
    }
  }
}

export const geminiService = new GeminiService()
export default geminiService