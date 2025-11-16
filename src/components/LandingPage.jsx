import { useState } from 'react'
import { Heart, Mic, Brain, TrendingUp, Zap, Shield, Award, ArrowRight, CheckCircle, Star, Users, Globe, BarChart3 } from 'lucide-react'

export default function LandingPage({ onGetStarted }) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Heart,
      title: "Emotional Intelligence Coaching",
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
      icon: TrendingUp,
      title: "Progress Tracking & Analytics",
      description: "Comprehensive dashboards showing your improvement over time with actionable insights",
      color: "from-blue-500 to-cyan-500",
      details: [
        "Daily progress trends",
        "Skill development heatmaps",
        "Comparative benchmarking",
        "Goal achievement tracking"
      ]
    },
    {
      icon: Users,
      title: "Presentation Practice Modes",
      description: "Specialized training for business pitches, job interviews, and public speaking scenarios",
      color: "from-green-500 to-emerald-500",
      details: [
        "Business pitch training",
        "Job interview simulation",
        "Conference talk preparation",
        "Elevator pitch mastery"
      ]
    }
  ]

  const stats = [
    { number: "95%", label: "Confidence Improvement", icon: Shield },
    { number: "10+", label: "Languages Supported", icon: Globe },
    { number: "50K+", label: "Practice Sessions", icon: Mic },
    { number: "4.9", label: "User Rating", icon: Star }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "The emotional intelligence coaching transformed my presentation skills. I can now detect and adjust my confidence levels in real-time.",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      role: "Sales Director", 
      content: "The AI analysis helped me identify speaking patterns I never noticed. My pitch success rate increased by 40%.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Public Speaker",
      content: "Finally, a tool that understands the emotional side of communication. The anxiety detection feature is a game-changer.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Emotional Intelligence</span> in Communication
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The world's first AI-powered platform that analyzes your emotional intelligence, confidence levels, and speaking patterns in real-time. Transform how you communicate with advanced speech coaching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button className="text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/50 transition-all duration-200 flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Try Demo
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes every aspect of your communication, from emotional intelligence to professional presence
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${feature.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-3">{feature.description}</p>
                        {activeFeature === index && (
                          <ul className="space-y-2">
                            {feature.details.map((detail, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feature Visualization */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Live Analysis</h4>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Mock Dashboard */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Confidence Level</span>
                      <span className="text-white font-bold">87%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Energy Level</span>
                      <span className="text-white font-bold">High ⚡</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Anxiety Score</span>
                      <span className="text-white font-bold">Low 😌</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h5 className="text-white font-medium mb-2">Real-time Feedback</h5>
                  <p className="text-white/80 text-sm">🌟 Excellent confidence! Your enthusiasm is engaging the audience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Communication Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See how our emotional intelligence coaching transforms careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
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
            Join thousands of professionals who've mastered their emotional intelligence with our AI coaching
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              View Pricing
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="ml-3 text-xl font-bold">Eloquent</span>
              </div>
              <p className="text-gray-400">
                Master your emotional intelligence and transform your communication with AI-powered coaching.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emotional Intelligence</li>
                <li>Speech Analysis</li>
                <li>Progress Tracking</li>
                <li>Presentation Practice</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
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