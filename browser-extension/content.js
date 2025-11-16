// Eloquent Text Assistant - Content Script
class EloquentTextAssistant {
  constructor() {
    this.isEnabled = true
    this.currentTextArea = null
    this.assistantWidget = null
    this.debounceTimer = null
    this.apiKey = null
    
    this.init()
  }

  async init() {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['eloquentApiKey', 'eloquentEnabled'])
    this.apiKey = result.eloquentApiKey
    this.isEnabled = result.eloquentEnabled !== false

    if (this.isEnabled) {
      this.attachToTextAreas()
      this.createAssistantWidget()
    }
  }

  attachToTextAreas() {
    // Find all text inputs and textareas
    const textElements = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
    
    textElements.forEach(element => {
      this.attachToElement(element)
    })

    // Watch for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const textElements = node.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
            textElements.forEach(element => {
              this.attachToElement(element)
            })
          }
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  attachToElement(element) {
    // Skip if already attached
    if (element.dataset.eloquentAttached) return

    element.dataset.eloquentAttached = 'true'

    // Add event listeners
    element.addEventListener('focus', (e) => {
      this.currentTextArea = e.target
      this.showAssistantWidget(e.target)
    })

    element.addEventListener('input', (e) => {
      this.handleTextInput(e.target)
    })

    element.addEventListener('blur', (e) => {
      // Hide widget after a delay
      setTimeout(() => {
        if (this.assistantWidget && !this.assistantWidget.matches(':hover')) {
          this.hideAssistantWidget()
        }
      }, 200)
    })
  }

  handleTextInput(element) {
    const text = this.getElementText(element)
    
    if (text.length > 20) {
      // Clear previous timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      // Analyze after user stops typing
      this.debounceTimer = setTimeout(() => {
        this.analyzeText(text, element)
      }, 1500)
    }
  }

  getElementText(element) {
    if (element.contentEditable === 'true') {
      return element.innerText || element.textContent
    }
    return element.value
  }

  setElementText(element, text) {
    if (element.contentEditable === 'true') {
      element.innerText = text
    } else {
      element.value = text
    }
    
    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }

  analyzeText(text, element) {
    // Basic repetition detection (client-side)
    const analysis = this.detectRepetition(text)
    
    if (analysis.repetitionRate > 8) {
      this.showRepetitionWarning(analysis, element)
    } else {
      this.hideRepetitionWarning()
    }
  }

  detectRepetition(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)

    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    const repeatedWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])

    const totalRepetitions = repeatedWords.reduce((sum, [, count]) => sum + (count - 1), 0)
    const repetitionRate = words.length > 0 ? (totalRepetitions / words.length) * 100 : 0

    return {
      totalWords: words.length,
      totalRepetitions,
      repetitionRate,
      repeatedWords: repeatedWords.slice(0, 5)
    }
  }

  createAssistantWidget() {
    this.assistantWidget = document.createElement('div')
    this.assistantWidget.id = 'eloquent-assistant-widget'
    this.assistantWidget.innerHTML = `
      <div class="eloquent-widget-content">
        <div class="eloquent-header">
          <span class="eloquent-icon">✨</span>
          <span class="eloquent-title">Eloquent Assistant</span>
          <button class="eloquent-close" onclick="this.parentElement.parentElement.parentElement.style.display='none'">×</button>
        </div>
        <div class="eloquent-analysis" id="eloquent-analysis">
          <div class="eloquent-status">Ready to help improve your text</div>
        </div>
        <div class="eloquent-actions">
          <button class="eloquent-btn eloquent-btn-primary" id="eloquent-improve-btn">
            <span class="eloquent-btn-icon">🪄</span>
            Improve Text
          </button>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #eloquent-assistant-widget {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        display: none;
      }

      .eloquent-widget-content {
        padding: 16px;
      }

      .eloquent-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f3f4f6;
      }

      .eloquent-icon {
        font-size: 16px;
        margin-right: 8px;
      }

      .eloquent-title {
        font-weight: 600;
        color: #1f2937;
        flex: 1;
      }

      .eloquent-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .eloquent-close:hover {
        color: #374151;
      }

      .eloquent-analysis {
        margin-bottom: 12px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
        font-size: 12px;
      }

      .eloquent-status {
        color: #6b7280;
      }

      .eloquent-warning {
        color: #d97706;
        font-weight: 500;
      }

      .eloquent-repetition-info {
        margin-top: 4px;
        font-size: 11px;
        color: #9ca3af;
      }

      .eloquent-actions {
        display: flex;
        gap: 8px;
      }

      .eloquent-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #374151;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .eloquent-btn:hover {
        background: #f9fafb;
      }

      .eloquent-btn-primary {
        background: #8b5cf6;
        color: white;
        border-color: #8b5cf6;
      }

      .eloquent-btn-primary:hover {
        background: #7c3aed;
      }

      .eloquent-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .eloquent-btn-icon {
        font-size: 12px;
      }

      .eloquent-repeated-words {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .eloquent-word-tag {
        background: #fef3c7;
        color: #d97706;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(this.assistantWidget)

    // Add event listeners
    document.getElementById('eloquent-improve-btn').addEventListener('click', () => {
      this.improveCurrentText()
    })
  }

  showAssistantWidget(element) {
    if (!this.assistantWidget) return

    this.assistantWidget.style.display = 'block'
    
    // Position near the element
    const rect = element.getBoundingClientRect()
    const widget = this.assistantWidget
    
    // Position to the right of the element if there's space
    if (rect.right + 320 < window.innerWidth) {
      widget.style.left = (rect.right + 10) + 'px'
      widget.style.right = 'auto'
    } else {
      widget.style.right = '20px'
      widget.style.left = 'auto'
    }
    
    widget.style.top = Math.max(20, rect.top) + 'px'
  }

  hideAssistantWidget() {
    if (this.assistantWidget) {
      this.assistantWidget.style.display = 'none'
    }
  }

  showRepetitionWarning(analysis, element) {
    const analysisDiv = document.getElementById('eloquent-analysis')
    if (!analysisDiv) return

    analysisDiv.innerHTML = `
      <div class="eloquent-warning">
        ⚠️ High repetition detected (${analysis.repetitionRate.toFixed(1)}%)
      </div>
      <div class="eloquent-repetition-info">
        ${analysis.totalRepetitions} repeated words found
      </div>
      <div class="eloquent-repeated-words">
        ${analysis.repeatedWords.map(([word, count]) => 
          `<span class="eloquent-word-tag">${word} (${count}x)</span>`
        ).join('')}
      </div>
    `
  }

  hideRepetitionWarning() {
    const analysisDiv = document.getElementById('eloquent-analysis')
    if (!analysisDiv) return

    analysisDiv.innerHTML = `
      <div class="eloquent-status">Text looks good! ✅</div>
    `
  }

  async improveCurrentText() {
    if (!this.currentTextArea) return

    const text = this.getElementText(this.currentTextArea)
    if (!text.trim()) return

    const improveBtn = document.getElementById('eloquent-improve-btn')
    if (!improveBtn) return

    // Show loading state
    improveBtn.disabled = true
    improveBtn.innerHTML = '<span class="eloquent-btn-icon">⏳</span> Improving...'

    try {
      // If user has API key, use Gemini AI
      if (this.apiKey) {
        const improved = await this.callGeminiAPI(text)
        this.setElementText(this.currentTextArea, improved)
      } else {
        // Use basic improvement
        const improved = this.basicImprovement(text)
        this.setElementText(this.currentTextArea, improved)
      }

      // Show success
      improveBtn.innerHTML = '<span class="eloquent-btn-icon">✅</span> Improved!'
      setTimeout(() => {
        improveBtn.disabled = false
        improveBtn.innerHTML = '<span class="eloquent-btn-icon">🪄</span> Improve Text'
      }, 2000)

    } catch (error) {
      console.error('Error improving text:', error)
      improveBtn.disabled = false
      improveBtn.innerHTML = '<span class="eloquent-btn-icon">❌</span> Error'
      setTimeout(() => {
        improveBtn.innerHTML = '<span class="eloquent-btn-icon">🪄</span> Improve Text'
      }, 2000)
    }
  }

  basicImprovement(text) {
    // Basic synonym replacement
    const synonyms = {
      'good': ['excellent', 'great', 'wonderful'],
      'bad': ['poor', 'terrible', 'disappointing'],
      'big': ['large', 'huge', 'massive'],
      'small': ['tiny', 'compact', 'miniature'],
      'very': ['extremely', 'incredibly', 'remarkably'],
      'really': ['truly', 'genuinely', 'absolutely']
    }

    let improved = text
    const words = text.split(' ')
    const wordCount = {}

    // Count word frequency
    words.forEach(word => {
      const clean = word.toLowerCase().replace(/[^\w]/g, '')
      wordCount[clean] = (wordCount[clean] || 0) + 1
    })

    // Replace repeated words with synonyms
    Object.entries(wordCount).forEach(([word, count]) => {
      if (count > 2 && synonyms[word]) {
        const synonym = synonyms[word][Math.floor(Math.random() * synonyms[word].length)]
        // Replace one instance with synonym
        improved = improved.replace(new RegExp(`\\b${word}\\b`, 'i'), synonym)
      }
    })

    return improved
  }

  async callGeminiAPI(text) {
    // This would call your Eloquent app's API endpoint
    // For now, return basic improvement
    return this.basicImprovement(text)
  }
}

// Initialize the assistant
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EloquentTextAssistant()
  })
} else {
  new EloquentTextAssistant()
}