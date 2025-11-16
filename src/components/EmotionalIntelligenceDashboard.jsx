import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Heart, TrendingUp, Award, Target, Zap, Shield, Brain, Crown, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useUsageTracking } from '../hooks/useUsageTracking'

export default function EmotionalIntelligenceDashboard() {
  const [emotionalData, setEmotionalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [overallStats, setOverallStats] = useState(null)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)
  const { usage } = useUsageTracking()

  useEffect(() => {
    fetchEmotionalData()
  }, [])

  const fetchEmotionalData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch real emotional intelligence data
      const { data: eiSessions, error: eiError } = await supabase
        .from('emotional_intelligence_sessions')
        .select(`
          *,
          practice_sessions!inner(created_at, transcript)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (eiError && eiError.code !== 'PGRST116') throw eiError

      let emotionalSessions = []

      if (eiSessions && eiSessions.length > 0) {
        // Use real EI data
        setIsUsingFallbackData(false)
        emotionalSessions = eiSessions.map(session => ({
          id: session.id,
          date: new Date(session.created_at).toLocaleDateString(),
          confidence: session.confidence_level,
          energy: session.energy_level,
          anxiety: session.anxiety_score,
          positivity: session.positivity_score,
          overall: session.overall_ei_score || 
            Math.round((session.confidence_level + session.positivity_score + Math.max(0, 100 - session.anxiety_score * 10)) / 3)
        }))
      } else {
        // Fallback: simulate data from practice sessions for users without EI data yet
        setIsUsingFallbackData(true)
        const { data: sessions, error } = await supabase
          .from('practice_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        emotionalSessions = sessions.map((session, index) => ({
          id: session.id,
          date: new Date(session.created_at).toLocaleDateString(),
          confidence: session.confidence_level || Math.min(100, Math.max(30, 70 + (session.fluency_score - 70) * 0.5 + Math.random() * 20 - 10)),
          energy: session.energy_level || ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
          anxiety: session.anxiety_score || Math.max(0, Math.min(10, 5 - (session.fluency_score - 50) * 0.1 + Math.random() * 3)),
          positivity: session.positivity_score || Math.min(100, Math.max(20, 60 + Math.random() * 40)),
          overall: Math.min(100, Math.max(40, session.fluency_score + Math.random() * 20 - 10))
        }))
      }

      setEmotionalData(emotionalSessions)
      calculateOverallStats(emotionalSessions)
      
    } catch (error) {
      console.error('Error fetching emotional data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallStats = (data) => {
    if (data.length === 0) return

    const avgConfidence = data.reduce((sum, session) => sum + session.confidence, 0) / data.length
    const avgAnxiety = data.reduce((sum, session) => sum + session.anxiety, 0) / data.length
    const avgPositivity = data.reduce((sum, session) => sum + session.positivity, 0) / data.length
    const avgOverall = data.reduce((sum, session) => sum + session.overall, 0) / data.length

    // Calculate trends (last 5 vs previous 5 sessions)
    const recent = data.slice(0, 5)
    const previous = data.slice(5, 10)
    
    const recentConfidence = recent.reduce((sum, s) => sum + s.confidence, 0) / recent.length
    const previousConfidence = previous.length > 0 ? previous.reduce((sum, s) => sum + s.confidence, 0) / previous.length : recentConfidence
    
    const confidenceTrend = recentConfidence - previousConfidence

    // Energy distribution
    const energyDistribution = {
      high: data.filter(s => s.energy === 'high').length,
      moderate: data.filter(s => s.energy === 'moderate').length,
      low: data.filter(s => s.energy === 'low').length
    }

    setOverallStats({
      avgConfidence: Math.round(avgConfidence),
      avgAnxiety: Math.round(avgAnxiety * 10) / 10,
      avgPositivity: Math.round(avgPositivity),
      avgOverall: Math.round(avgOverall),
      confidenceTrend: Math.round(confidenceTrend * 10) / 10,
      energyDistribution,
      totalSessions: data.length
    })
  }

  const getRadarData = () => {
    if (!overallStats) return []

    return [
      {
        skill: 'Confidence',
        score: overallStats.avgConfidence,
        fullMark: 100
      },
      {
        skill: 'Energy',
        score: (overallStats.energyDistribution.high * 100 + overallStats.energyDistribution.moderate * 60) / overallStats.totalSessions,
        fullMark: 100
      },
      {
        skill: 'Calmness',
        score: Math.max(0, 100 - (overallStats.avgAnxiety * 10)),
        fullMark: 100
      },
      {
        skill: 'Positivity',
        score: overallStats.avgPositivity,
        fullMark: 100
      },
      {
        skill: 'Overall',
        score: overallStats.avgOverall,
        fullMark: 100
      }
    ]
  }

  const getConfidenceChartData = () => {
    return emotionalData.slice(0, 10).reverse().map((session, index) => ({
      session: index + 1,
      confidence: session.confidence,
      anxiety: session.anxiety * 10, // Scale for visibility
      positivity: session.positivity,
      date: session.date
    }))
  }

  const getTrendIcon = (trend) => {
    if (trend > 2) return <TrendingUp className="w-5 h-5 text-green-500" />
    if (trend < -2) return <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
    return <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
  }

  const getEnergyColor = (energy) => {
    switch (energy) {
      case 'high': return 'bg-red-500'
      case 'moderate': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading emotional intelligence data...</div>
      </div>
    )
  }

  // Show upgrade prompt for free users
  if (!usage.hasEIAccess) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-3xl font-bold gradient-text mb-2">🎭 Emotional Intelligence Dashboard</h1>
          <p className="text-gray-600 text-lg">Track your confidence, energy, and emotional presence</p>
        </div>

        <div className="text-center glass rounded-2xl p-8 border-2 border-purple-200">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Unlock Emotional Intelligence Coaching</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get real-time feedback on your confidence, energy levels, and emotional presence. 
            Track your progress with advanced analytics and personalized coaching insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900 mb-1">Confidence Tracking</h4>
              <p className="text-sm text-purple-700">Real-time confidence level monitoring</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900 mb-1">Energy Analysis</h4>
              <p className="text-sm text-blue-700">Track your speaking energy and enthusiasm</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900 mb-1">Anxiety Management</h4>
              <p className="text-sm text-green-700">Monitor and reduce speaking anxiety</p>
            </div>
          </div>

          <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro - $9/month
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            ✨ 14-day free trial • Cancel anytime • Unlock all EI features
          </p>
        </div>
      </div>
    )
  }

  if (emotionalData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center glass rounded-2xl p-8">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Emotional Intelligence</h3>
          <p className="text-gray-600 mb-6">
            Complete practice sessions to see your emotional intelligence analysis and progress.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 animate-fadeInDown">
        <h1 className="text-3xl font-bold gradient-text mb-2">🎭 Emotional Intelligence Dashboard</h1>
        <p className="text-gray-600 text-lg">Track your confidence, energy, and emotional presence</p>
        
        {/* Data Source Indicator */}
        {isUsingFallbackData && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-800 text-sm font-medium">
                📊 Showing simulated data based on your practice sessions
              </span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Complete practice sessions with EI coaching enabled to see real emotional intelligence analysis
            </p>
          </div>
        )}
        
        {!isUsingFallbackData && emotionalData.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-800 text-sm font-medium">
                ✅ Showing real emotional intelligence data from your sessions
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      {overallStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 text-center animate-fadeInUp">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{overallStats.avgConfidence}%</div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
            <div className="flex items-center justify-center mt-1">
              {getTrendIcon(overallStats.confidenceTrend)}
              <span className="text-xs text-gray-500 ml-1">
                {overallStats.confidenceTrend > 0 ? '+' : ''}{overallStats.confidenceTrend}
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {Math.round((overallStats.energyDistribution.high / overallStats.totalSessions) * 100)}%
            </div>
            <div className="text-sm text-gray-600">High Energy</div>
            <div className="flex justify-center mt-2 space-x-1">
              <div className={`w-2 h-2 rounded-full ${getEnergyColor('high')}`}></div>
              <div className={`w-2 h-2 rounded-full ${getEnergyColor('moderate')}`}></div>
              <div className={`w-2 h-2 rounded-full ${getEnergyColor('low')}`}></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(Math.max(0, 100 - (overallStats.avgAnxiety * 10)))}%
            </div>
            <div className="text-sm text-gray-600">Calmness</div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.avgAnxiety < 3 ? 'Very Calm' : overallStats.avgAnxiety < 5 ? 'Calm' : 'Needs Work'}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{overallStats.avgPositivity}%</div>
            <div className="text-sm text-gray-600">Positivity</div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.avgPositivity > 70 ? 'Very Positive' : overallStats.avgPositivity > 50 ? 'Positive' : 'Neutral'}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{overallStats.avgOverall}%</div>
            <div className="text-sm text-gray-600">Overall EQ</div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.avgOverall > 80 ? 'Excellent' : overallStats.avgOverall > 60 ? 'Good' : 'Developing'}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confidence Trend */}
        <div className="glass rounded-2xl p-6 animate-slideInRight">
          <h3 className="text-lg font-semibold gradient-text-purple mb-4">📈 Emotional Intelligence Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getConfidenceChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}${name === 'anxiety' ? '/10' : '%'}`, 
                  name === 'anxiety' ? 'Anxiety Level' : name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                labelFormatter={(label) => `Session ${label}`}
              />
              <Line type="monotone" dataKey="confidence" stroke="#8B5CF6" strokeWidth={2} name="confidence" />
              <Line type="monotone" dataKey="positivity" stroke="#F59E0B" strokeWidth={2} name="positivity" />
              <Line type="monotone" dataKey="anxiety" stroke="#EF4444" strokeWidth={2} name="anxiety" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotional Intelligence Radar */}
        <div className="glass rounded-2xl p-6 animate-slideInRight" style={{animationDelay: '0.2s'}}>
          <h3 className="text-lg font-semibold gradient-text-blue mb-4">🎯 EQ Skills Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getRadarData()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="EQ Skills"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      {overallStats && (
        <div className="glass rounded-2xl p-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold gradient-text mb-4">🧠 AI Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <h4 className="font-medium text-purple-900 mb-3">🎯 Strengths</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                {overallStats.avgConfidence > 70 && (
                  <li>• Strong confidence levels - you sound credible and assured</li>
                )}
                {overallStats.avgPositivity > 70 && (
                  <li>• Positive communication style engages your audience</li>
                )}
                {overallStats.avgAnxiety < 3 && (
                  <li>• Excellent composure - you remain calm under pressure</li>
                )}
                {overallStats.energyDistribution.high / overallStats.totalSessions > 0.4 && (
                  <li>• High energy delivery keeps listeners engaged</li>
                )}
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-3">📈 Growth Areas</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                {overallStats.avgConfidence < 60 && (
                  <li>• Practice using more definitive language to boost confidence</li>
                )}
                {overallStats.avgAnxiety > 5 && (
                  <li>• Work on breathing techniques to reduce speaking anxiety</li>
                )}
                {overallStats.energyDistribution.low / overallStats.totalSessions > 0.5 && (
                  <li>• Try adding more enthusiasm and energy to your delivery</li>
                )}
                {overallStats.avgPositivity < 50 && (
                  <li>• Incorporate more positive language and optimistic framing</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}