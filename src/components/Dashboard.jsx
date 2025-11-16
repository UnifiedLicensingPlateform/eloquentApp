import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Minus, Target, Award, Calendar, Mic } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { analyzeSpeechPatterns } from '../utils/speechAnalysis'

export default function Dashboard({ onStartFirstSession }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSessions(data || [])

      // Analyze patterns
      if (data && data.length > 0) {
        const analysis = analyzeSpeechPatterns(data)
        setStats(analysis)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChartData = () => {
    return sessions
      .slice(0, 10) // Last 10 sessions
      .reverse()
      .map((session, index) => ({
        session: index + 1,
        repetitionRate: session.repetition_rate || 0,
        fluencyScore: session.fluency_score || 0,
        date: new Date(session.created_at).toLocaleDateString()
      }))
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5 text-green-500" />
      case 'declining':
        return <TrendingUp className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600'
      case 'declining':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading your progress...</div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center glass rounded-3xl p-8 sm:p-12 animate-fadeInUp">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-3">Ready to start practicing?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Begin your journey to better communication with your first practice session.
            </p>
            <button
              onClick={() => (onStartFirstSession ? onStartFirstSession() : window.location.reload())}
              className="btn-gradient inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-white font-semibold"
            >
              <Mic className="w-5 h-5" />
              <span>Start Your First Session</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const chartData = formatChartData()
  const latestSession = sessions[0]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Your Progress 📈</h1>
          <p className="text-gray-600 text-lg">Track your communication improvement over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Fluency Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestSession?.fluency_score?.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">%</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Repetition Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageRepetitionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                {getTrendIcon(stats?.trend)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trend</p>
                <p className={`text-2xl font-bold ${getTrendColor(stats?.trend)}`}>
                  {stats?.trend === 'improving' ? 'Improving' :
                    stats?.trend === 'declining' ? 'Needs Work' : 'Stable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 animate-slideInRight">
            <h3 className="text-lg font-semibold gradient-text-blue mb-4">📈 Fluency Score Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Fluency Score']}
                  labelFormatter={(label) => `Session ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="fluencyScore"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 animate-slideInRight" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold gradient-text-purple mb-4">📉 Repetition Rate Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Repetition Rate']}
                  labelFormatter={(label) => `Session ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="repetitionRate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="glass rounded-2xl p-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold gradient-text mb-4">📋 Recent Practice Sessions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Words Spoken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repetitions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repetition Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fluency Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.slice(0, 10).map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.word_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.repetition_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(session.repetition_rate || 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(session.fluency_score || 0) >= 80
                          ? 'bg-green-100 text-green-800'
                          : (session.fluency_score || 0) >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {(session.fluency_score || 0).toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}