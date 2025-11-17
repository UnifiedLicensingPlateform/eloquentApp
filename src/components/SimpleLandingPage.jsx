import { useState } from 'react'
import { Heart, Mic, Brain, TrendingUp, Shield, ArrowRight, CheckCircle, Star, Globe, Briefcase, Presentation, Play, Sparkles, Chrome, FileText, PenTool, Users, Target } from 'lucide-react'
import Auth from './Auth'

export default function SimpleLandingPage() {
  const [showAuth, setShowAuth] = useState(false)

  if (showAuth) {
    return <Auth onBack={() => setShowAuth(false)} />
  }

  const coreFeatures = [
    {
      icon: Heart,
      title: "🎭 Emotional Intelligence Coaching",
      description: "Real-time analysis of confidence, energy, and emotional tone during speech practice",
      color: "from-pink-500 to-rose-500",
      details: [
        "Live confidence level tracking",
        "Energy and enthusiasm detection",
        "Anxiety indicators with calming tips",
        "Emotional tone analysis"
      ]
    },
    {
      icon: Brain,
      title: "AI-Powered Speech Analysis",
      description: "Advanced sentiment analysis and speaking pattern recognition with personalized feedback",
      color: "from-purple-500 to-indigo-500",
      details: [
        "Speaking pace optimization",
        "Filler word detection",
        "Voice quality assessment",
        "Professional presence scoring"
      ]
    },
    {
      icon: PenTool,
      title: "Smart Text Assistant",
      description: "Real-time writing improvement with AI-powered repetition detection and vocabulary enhancement",
      color: "from-green-500 to-emerald-500",
      details: [
        "Real-time repetition detection",
        "AI-powered text improvements",
        "Multi-language support (10+ languages)",
        "Works anywhere you type"
      ]
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics & Progress Tracking",
      description: "Comprehensive dashboards showing your improvement over time with actionable insights",
      color: "from-blue-500 to-cyan-500",
      details: [
        "Daily progress trends",
        "Skill development heatmaps",
        "Comparative benchmarking",
        "Goal achievement tracking"
      ]
    }
  ]

  const practiceModesFeatures = [
    {
      icon: Briefcase,
      title: "Job Interview Mastery",
      description: "Master the STAR method with structured 2-minute practice sessions",
      color: "from-emerald-500 to-teal-500",
      badge: "LIVE",
      details: ["STAR method coaching", "2-minute structured format", "Confidence tracking", "Real-time feedback"]
    },
    {
      icon: Presentation,
      title: "Business Presentations",
      description: "Perfect your pitches, meetings, and professional presentations",
      color: "from-blue-500 to-indigo-500",
      badge: "PRO",
      details: ["5-min business pitches", "Team meeting practice", "10-min public speeches", "Real-time analysis"]
    },
    {
      icon: Brain,
      title: "Guided Topic Practice",
      description: "Structured practice across 6 different conversation categories",
      color: "from-purple-500 to-indigo-500",
      badge: "POPULAR",
      details: ["Business & Professional", "Personal Development", "Social & Relationships", "Creative & Hobbies"]
    },
    {
      icon: Target,
      title: "Structured Speaking",
      description: "Learn proper speech organization with intro-body-conclusion format",
      color: "from-orange-500 to-red-500",
      badge: "FOUNDATION",
      details: ["Introduction techniques", "Supporting details", "Strong conclusions", "Time management"]
    },
    {
      icon: Heart,
      title: "Wedding & Special Events",
      description: "Master life's most important moments with emotional guidance",
      color: "from-rose-500 to-pink-500",
      badge: "VIRAL",
      details: ["Wedding speeches", "Best man/Maid of honor", "Anniversary toasts", "Memorial speeches"]
    },
    {
      icon: Sparkles,
      title: "Free Speaking Practice",
      description: "60-second sessions to practice spontaneous speaking on any topic",
      color: "from-cyan-500 to-blue-500",
      badge: "STARTER",
      details: ["60-second sessions", "Any topic freedom", "Word repetition analysis", "Fluency scoring"]
    }
  ]

  const textAssistantFeatures = [
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Works on Gmail, LinkedIn, Twitter, and any website",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: FileText,
      title: "Web App Integration",
      description: "Built-in text editor with real-time analysis",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Supports 10+ languages with cultural sensitivity",
      color: "from-green-500 to-blue-500"
    }
  ]

  const stats = [
    { number: "95%", label: "Confidence Improvement", icon: Shield },
    { number: "10+", label: "Languages Supported", icon: Globe },
    { number: "50K+", label: "Practice Sessions", icon: Mic },
    { number: "4.9", label: "User Rating", icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Eloquent Logo" 
                className="h-16 w-auto drop-shadow-lg"
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The Complete <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Communication</span> Improvement Platform
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Master both speech and writing with AI-powered coaching. From job interviews to wedding speeches, from emails to social media - improve every aspect of your communication with real-time emotional intelligence analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button className="text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/50 transition-all duration-200 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className="w-6 h-6 text-blue-600 mr-2" />
                      <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Communicate Better
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The only platform that improves both your speech and writing with AI-powered coaching
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Smart Text Assistant Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-800 font-medium text-sm">REVOLUTIONARY FEATURE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Text Assistant - Write Better Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time writing improvement that works on any website. From emails to social media, improve your text as you type.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Works Everywhere You Write
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {textAssistantFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${feature.color} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Gmail - Compose Email</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-xs">LIVE ANALYSIS</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-gray-800 text-sm mb-2">
                    "I think this is a <span className="bg-yellow-200">good</span> idea and I really think it's <span className="bg-yellow-200">good</span> for our team..."
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">⚠️ High repetition detected</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Improve</button>
                  </div>
                </div>
                
                <div className="bg-green-100 rounded-lg p-4">
                  <p className="text-gray-800 text-sm mb-2">
                    "I believe this is an <span className="bg-green-200">excellent</span> idea and I genuinely think it's <span className="bg-green-200">beneficial</span> for our team..."
                  </p>
                  <div className="text-xs text-green-600">✅ Improved - More engaging vocabulary</div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📧", title: "Email Writing", desc: "Gmail, Outlook, Yahoo" },
              { icon: "💼", title: "Social Media", desc: "LinkedIn, Twitter, Facebook" },
              { icon: "💬", title: "Messaging", desc: "Slack, Teams, WhatsApp" },
              { icon: "📝", title: "Documents", desc: "Google Docs, Word, Notion" }
            ].map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                <p className="text-gray-600 text-sm">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Modes Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium text-sm">SPECIALIZED COACHING</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Master Every Communication Scenario That Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From career-defining interviews to viral content creation - AI coaching for every situation where your words can change everything
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {practiceModesFeatures.map((mode, index) => {
              const Icon = mode.icon
              return (
                <div key={index} className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  {mode.badge && (
                    <div className={`absolute -top-3 -right-3 ${
                      mode.badge === '🔥' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      mode.badge === 'VIRAL' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                      mode.badge === 'HOT' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                      mode.badge === 'TRENDING' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      mode.badge === 'ELITE' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                      'bg-gradient-to-r from-blue-500 to-purple-500'
                    } text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse`}>
                      {mode.badge}
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${mode.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                  
                  {mode.details && (
                    <ul className="space-y-1 mb-4">
                      {mode.details.slice(0, 2).map((detail, idx) => (
                        <li key={idx} className="flex items-center text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                      <li className="text-xs text-gray-500 italic">+{mode.details.length - 2} more scenarios</li>
                    </ul>
                  )}
                  
                  <button 
                    onClick={() => setShowAuth(true)}
                    className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                  >
                    Master This <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands who've mastered both speech and writing with our comprehensive AI coaching platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              View All Features
            </button>
          </div>
          
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="Eloquent Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400">
                The complete communication improvement platform. Master speech and writing with AI-powered coaching.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Speech Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emotional Intelligence</li>
                <li>Practice Modes</li>
                <li>Speech Analysis</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Writing Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Smart Text Assistant</li>
                <li>Browser Extension</li>
                <li>Multi-Language Support</li>
                <li>Real-time Analysis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Eloquent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}