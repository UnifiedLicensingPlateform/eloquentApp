import { useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage.jsx'

export default function LanguageSelector() {
  const { currentLanguage, supportedLanguages, changeLanguage, getLanguageName } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode)
    setIsOpen(false)
  }

  const currentLang = supportedLanguages.find(lang => lang.language_code === currentLanguage)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 glass rounded-xl text-sm font-medium text-gray-700 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 backdrop-blur-sm"
      >
        <Globe className="w-4 h-4 mr-2 text-blue-500" />
        <span className="font-medium">{currentLang?.native_name || 'English'}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-2xl border border-white/20 z-20 overflow-hidden animate-fadeInDown">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-600 px-3 py-2 uppercase tracking-wider">
                Select Language
              </div>
              
              {supportedLanguages.map((language, index) => (
                <button
                  key={language.language_code}
                  onClick={() => handleLanguageChange(language.language_code)}
                  className={`w-full text-left px-3 py-3 text-sm rounded-xl transition-all duration-300 flex items-center justify-between group hover:bg-white/20 ${
                    currentLanguage === language.language_code 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-lg' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      currentLanguage === language.language_code
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-white/50'
                    }`}>
                      {language.language_code.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.native_name}</span>
                      <span className="text-xs text-gray-500">
                        {getLanguageName(language.language_code, 'en')}
                      </span>
                    </div>
                  </div>
                  
                  {currentLanguage === language.language_code && (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-white/20 px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                <span>AI speech recognition available for all languages</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}