import { AlertCircle, Crown, Zap } from 'lucide-react'

export default function UsageLimits({ 
  sessionsUsed = 0, 
  sessionsLimit = 5, 
  plan = 'free',
  onUpgrade 
}) {
  const usagePercentage = (sessionsUsed / sessionsLimit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = sessionsUsed >= sessionsLimit

  if (plan !== 'free') {
    return null // Don't show limits for paid plans
  }

  return (
    <div className={`rounded-lg border p-4 mb-6 ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Zap className="w-5 h-5 text-blue-500" />
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${
              isAtLimit ? 'text-red-800' : 'text-gray-900'
            }`}>
              Practice Sessions This Month
            </h3>
            <span className={`text-sm font-medium ${
              isAtLimit ? 'text-red-600' : 'text-gray-600'
            }`}>
              {sessionsUsed} / {sessionsLimit}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              isAtLimit ? 'text-red-700' : 'text-gray-600'
            }`}>
              {isAtLimit 
                ? 'You\'ve reached your monthly limit. Upgrade to continue practicing!'
                : isNearLimit
                ? 'You\'re almost at your monthly limit.'
                : `${sessionsLimit - sessionsUsed} sessions remaining this month.`
              }
            </p>
            
            <button
              onClick={onUpgrade}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isAtLimit
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}