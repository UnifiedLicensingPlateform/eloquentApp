import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Target, Clock, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316']

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState({
    weeklyProgress: [],
    topRepeatedWords: [],
    timeOfDayAnalysis: [],
    improvementTrend: [],
    loading: true
  })

  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [])

  const fetchAdvancedAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch last 30 days of sessions
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Process data for different analytics
      const weeklyProgress = processWeeklyProgress(sessions)
      const topRepeatedWords = processTopRepeatedWords(sessions)
      const timeOfDayAnalysis = processTimeOfDayAnalysis(sessions)
      const improvementTrend = processImprovementTrend(sessions)

      setAnalytics({
        weeklyProgress,
        topRepeatedWords,
        timeOfDayAnalysis,
        improvementTrend,
        loading: false
      })

    } catch (error) {
      console.error('Error fetching advanced analytics:', error)
      setAnalytics(prev => ({ ...prev, loading: false }))
    }
  }

  const processWeeklyProgress = (sessions) => {
    const weeklyData = {}
    
    sessions.forEach(session => {
      const date = new Date(session.created_at)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          sessions: 0,
          avgFluency: 0,
          avgRepetition: 0,
          totalWords: 0
        }
      }
      
      weeklyData[weekKey].sessions += 1
      weeklyData[weekKey].avgFluency += session.fluency_score || 0
      weeklyData[weekKey].avgRepetition += session.repetition_rate || 0
      weeklyData[weekKey].totalWords += session.word_count || 0
    })
    
    return Object.values(weeklyData).map(week => ({
      ...week,
      avgFluency: (week.avgFluency / week.sessions).toFixed(1),
      avgRepetition: (week.avgRepetition / week.sessions).toFixed(1),
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }

  const processTopRepeatedWords = (sessions) => {
    const wordCounts = {}
    
    sessions.forEach(session => {
      if (session.repeated_words) {
        Object.entries(session.repeated_words).forEach(([word, count]) => {
          wordCounts[word] = (wordCounts[word] || 0) + count
        })
      }
    })
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }))
  }

  const processTimeOfDayAnalysis = (sessions) => {
    const timeSlots = {
      'Morning (6-12)': 0,
      'Afternoon (12-18)': 0,
      'Evening (18-24)': 0,
      'Night (0-6)': 0
    }
    
    sessions.forEach(session => {
      const hour = new Date(session.created_at).getHours()
      
      if (hour >= 6 && hour < 12) timeSlots['Morning (6-12)']++
      else if (hour >= 12 && hour < 18) timeSlots['Afternoon (12-18)']++
      else if (hour >= 18 && hour < 24) timeSlots['Evening (18-24)']++
      else timeSlots['Night (0-6)']++
    })
    
    return Object.entries(timeSlots).map(([time, count]) => ({ time, count }))
  }

  const processImprovementTrend = (sessions) => {
    return sessions.map((session, index) => ({
      session: index + 1,
      fluencyScore: session.fluency_score || 0,
      repetitionRate: session.repetition_rate || 0,
      date: new Date(session.created_at).toLocaleDateString()
    }))
  }

  if (analytics.loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading advanced analytics...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
        <p className="text-gray-600">Deep insights into your speech patterns and improvement</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekly Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.weeklyProgress.length > 0 
                  ? analytics.weeklyProgress[analytics.weeklyProgress.length - 1]?.avgFluency || 0
                  : 0
                }
              </p>
              <p className="text-xs text-gray-500">Fluency Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Most Active Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.timeOfDayAnalysis.reduce((max, slot) => 
                  slot.count > max.count ? slot : max, { time: 'N/A', count: 0 }
                ).time.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">Practice Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Challenge</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.topRepeatedWords[0]?.word || 'None'}
              </p>
              <p className="text-xs text-gray-500">Most Repeated</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.weeklyProgress.reduce((sum, week) => sum + parseInt(week.totalWords), 0)}
              </p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgFluency" stroke="#3B82F6" name="Avg Fluency" />
              <Line type="monotone" dataKey="sessions" stroke="#10B981" name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time of Day Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Practice Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.timeOfDayAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ time, count }) => `${time}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.timeOfDayAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Repeated Words */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Repeated Words</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topRepeatedWords}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="word" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Improvement Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Progress Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.improvementTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="fluencyScore" stroke="#3B82F6" name="Fluency Score" />
              <Line type="monotone" dataKey="repetitionRate" stroke="#EF4444" name="Repetition Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Focus Areas</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {analytics.topRepeatedWords.slice(0, 3).map(({ word }) => (
                <li key={word}>• Work on reducing "{word}" repetition</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">📈 Progress Highlights</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Completed {analytics.improvementTrend.length} practice sessions</li>
              <li>• Most active during {analytics.timeOfDayAnalysis.reduce((max, slot) => 
                slot.count > max.count ? slot : max, { time: 'morning' }
              ).time.toLowerCase()}</li>
              <li>• Keep up the consistent practice!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}