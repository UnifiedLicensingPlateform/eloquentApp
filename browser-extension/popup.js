// Eloquent Text Assistant - Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const result = await chrome.storage.sync.get([
    'eloquentEnabled', 
    'eloquentApiKey',
    'textsImproved',
    'repetitionsFixed',
    'wordsEnhanced'
  ])

  const isEnabled = result.eloquentEnabled !== false
  const apiKey = result.eloquentApiKey || ''
  const stats = {
    textsImproved: result.textsImproved || 0,
    repetitionsFixed: result.repetitionsFixed || 0,
    wordsEnhanced: result.wordsEnhanced || 0
  }

  // Update UI
  updateStatus(isEnabled)
  updateStats(stats)
  document.getElementById('api-key').value = apiKey

  // Event listeners
  document.getElementById('toggle').addEventListener('click', toggleExtension)
  document.getElementById('save-api-key').addEventListener('click', saveApiKey)
  document.getElementById('test-btn').addEventListener('click', testOnPage)

  async function toggleExtension() {
    const newState = !isEnabled
    await chrome.storage.sync.set({ eloquentEnabled: newState })
    updateStatus(newState)
    
    // Reload current tab to apply changes
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.tabs.reload(tab.id)
  }

  function updateStatus(enabled) {
    const status = document.getElementById('status')
    const statusText = document.getElementById('status-text')
    const toggle = document.getElementById('toggle')

    if (enabled) {
      status.className = 'status enabled'
      statusText.textContent = 'Extension Enabled'
      toggle.className = 'toggle enabled'
    } else {
      status.className = 'status disabled'
      statusText.textContent = 'Extension Disabled'
      toggle.className = 'toggle'
    }
  }

  function updateStats(stats) {
    document.getElementById('texts-improved').textContent = stats.textsImproved
    document.getElementById('repetitions-fixed').textContent = stats.repetitionsFixed
    document.getElementById('words-enhanced').textContent = stats.wordsEnhanced
  }

  async function saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim()
    await chrome.storage.sync.set({ eloquentApiKey: apiKey })
    
    const btn = document.getElementById('save-api-key')
    const originalText = btn.textContent
    btn.textContent = 'Saved!'
    btn.style.background = '#10b981'
    btn.style.color = 'white'
    
    setTimeout(() => {
      btn.textContent = originalText
      btn.style.background = ''
      btn.style.color = ''
    }, 2000)
  }

  async function testOnPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    chrome.tabs.sendMessage(tab.id, { 
      action: 'showTestMessage' 
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Extension not loaded on this page
        alert('Please refresh the page and try again.')
      }
    })
  }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    chrome.storage.sync.get(['textsImproved', 'repetitionsFixed', 'wordsEnhanced'], (result) => {
      const newStats = {
        textsImproved: (result.textsImproved || 0) + (message.stats.textsImproved || 0),
        repetitionsFixed: (result.repetitionsFixed || 0) + (message.stats.repetitionsFixed || 0),
        wordsEnhanced: (result.wordsEnhanced || 0) + (message.stats.wordsEnhanced || 0)
      }
      
      chrome.storage.sync.set(newStats)
    })
  }
})