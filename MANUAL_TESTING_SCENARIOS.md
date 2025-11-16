# 📋 Manual Testing Scenarios - Eloquent App

## Overview
This document provides step-by-step manual testing scenarios for all major features in the Eloquent speech coaching application.

---

## 🎯 1. Basic Feature Access Testing

### Scenario 1.1: User Authentication
**Objective**: Verify user can sign up, sign in, and access the app

**Steps**:
1. Navigate to `localhost:5174`
2. Click "Sign Up" if new user or "Sign In" if existing
3. Enter valid email and password
4. Verify successful authentication
5. Check that dashboard loads properly

**Expected Results**:
- ✅ User can create account successfully
- ✅ User can sign in with valid credentials
- ✅ Dashboard displays after authentication
- ✅ Navigation menu is visible and functional

### Scenario 1.2: Navigation Testing
**Objective**: Verify all navigation elements work correctly

**Steps**:
1. Click each navigation item: Dashboard, Practice, Text Assistant, Emotional IQ, Pricing
2. Test both desktop and mobile navigation
3. Verify active states and transitions

**Expected Results**:
- ✅ All navigation items load correct pages
- ✅ Active states show current page
- ✅ Mobile navigation works on small screens
- ✅ Smooth transitions between pages

---

## 🎤 2. Speech Practice Feature Testing

### Scenario 2.1: Basic Practice Session
**Objective**: Test core speech practice functionality

**Steps**:
1. Go to "Practice" tab
2. Click "Start Practice Session"
3. Allow microphone access when prompted
4. Select a practice topic or use custom topic
5. Click "Start Recording"
6. Speak for 30-60 seconds
7. Click "Stop Recording"
8. Review results and analysis

**Expected Results**:
- ✅ Microphone permission requested and granted
- ✅ Recording starts and stops correctly
- ✅ Speech is transcribed accurately
- ✅ Fluency analysis is displayed
- ✅ Results are saved to dashboard

### Scenario 2.2: Real-Time Speech Analysis
**Objective**: Verify real-time feedback during speech

**Steps**:
1. Start a practice session
2. Begin speaking and observe real-time metrics
3. Vary speaking pace and confidence
4. Check for immediate feedback updates

**Expected Results**:
- ✅ Real-time transcription appears
- ✅ Fluency metrics update during speech
- ✅ Visual feedback responds to speech patterns
- ✅ No significant lag in analysis

---

## 🎭 3. Emotional Intelligence Coaching Testing

### Scenario 3.1: EI Feature Access Control
**Objective**: Test subscription-based access to EI features

**Steps**:
1. Ensure user is on Free plan
2. Navigate to "Emotional IQ" tab
3. Verify upgrade prompt appears
4. Upgrade to Pro plan (use manual SQL if needed)
5. Refresh page and check EI dashboard access

**Expected Results**:
- ✅ Free users see upgrade prompt
- ✅ Pro users see full EI dashboard
- ✅ Subscription status affects feature access
- ✅ Upgrade process works correctly

### Scenario 3.2: Real-Time EI Coaching
**Objective**: Test emotional intelligence analysis during speech

**Steps**:
1. Ensure Pro subscription is active
2. Go to Practice tab and start session
3. Begin speaking - EI coach panel should appear
4. Test different speech patterns:
   - **High Confidence**: "I am absolutely certain this will work perfectly"
   - **Low Confidence**: "Um, I think maybe this might work, I guess"
   - **High Energy**: "This is amazing! I'm so excited about this!"
   - **Anxiety**: "Um, so like, you know, I mean, uh, basically..."
5. Observe real-time metrics and feedback

**Expected Results**:
- ✅ EI coach panel appears during recording
- ✅ Confidence level updates based on language
- ✅ Energy level reflects enthusiasm
- ✅ Anxiety score increases with filler words
- ✅ Real-time feedback messages appear
- ✅ Emotional state icon changes appropriately

### Scenario 3.3: EI Dashboard Analytics
**Objective**: Verify historical EI data visualization

**Steps**:
1. Complete several practice sessions with EI coaching
2. Navigate to "Emotional IQ" dashboard
3. Check data source indicator (real vs fallback)
4. Review charts and metrics
5. Verify insights and recommendations

**Expected Results**:
- ✅ Charts populate with session data
- ✅ Metrics show accurate averages
- ✅ Trends reflect actual progress
- ✅ AI insights are relevant and helpful
- ✅ Data source clearly indicated

---

## 📝 4. Smart Text Assistant Testing

### Scenario 4.1: Text Analysis and Improvement
**Objective**: Test text repetition detection and AI improvement

**Steps**:
1. Go to "Text Assistant" tab
2. Enter repetitive text: "This is good and I think it's really good because good things are good"
3. Observe real-time analysis
4. Click "Improve Text"
5. Review improved version
6. Test copy functionality

**Expected Results**:
- ✅ Real-time repetition detection works
- ✅ Repetition rate calculated correctly
- ✅ AI improvement reduces repetition
- ✅ Improved text maintains original meaning
- ✅ Copy to clipboard works

### Scenario 4.2: Voice Dictation Testing
**Objective**: Test speech-to-text functionality

**Steps**:
1. In Text Assistant, click "Dictate" button
2. Allow microphone access
3. Speak clearly: "This is a test of the voice dictation feature"
4. Verify text appears in real-time
5. Click "Stop" to end dictation
6. Test "Improve Text" on dictated content
7. Use "Listen" button to hear improved text

**Expected Results**:
- ✅ Dictate button starts voice recognition
- ✅ Speech transcribed accurately in real-time
- ✅ Visual indicators show listening status
- ✅ Stop button ends dictation
- ✅ Dictated text can be improved
- ✅ Text-to-speech reads improved text clearly

### Scenario 4.3: Multi-Language Voice Support
**Objective**: Test voice features in different languages

**Steps**:
1. Change language using language selector
2. Test voice dictation in selected language
3. Verify speech recognition accuracy
4. Test text-to-speech in same language

**Expected Results**:
- ✅ Voice recognition adapts to selected language
- ✅ Transcription accuracy maintained across languages
- ✅ Text-to-speech uses correct language/accent
- ✅ UI updates reflect language changes

---

## 💳 5. Subscription and Billing Testing

### Scenario 5.1: Plan Upgrade Testing
**Objective**: Test subscription upgrade functionality

**Steps**:
1. Ensure user is on Free plan
2. Go to "Pricing" tab
3. Click "Start Pro Trial" button
4. Verify upgrade process
5. Check feature access changes
6. Verify billing information updates

**Expected Results**:
- ✅ Upgrade button triggers subscription change
- ✅ Pro features become accessible
- ✅ Billing status updates correctly
- ✅ No errors during upgrade process

### Scenario 5.2: Feature Access Validation
**Objective**: Verify features are properly gated by subscription

**Steps**:
1. Test each feature on Free plan
2. Note which features are restricted
3. Upgrade to Pro plan
4. Retest all features
5. Verify access changes

**Expected Results**:
- ✅ Free plan has appropriate limitations
- ✅ Pro plan unlocks all features
- ✅ Feature gates work correctly
- ✅ No unauthorized access to premium features

---

## 📊 6. Analytics and Progress Tracking

### Scenario 6.1: Dashboard Analytics
**Objective**: Test progress tracking and analytics display

**Steps**:
1. Complete multiple practice sessions
2. Navigate to Dashboard
3. Review progress charts and metrics
4. Check session history
5. Verify data accuracy

**Expected Results**:
- ✅ Charts display session data correctly
- ✅ Progress trends are accurate
- ✅ Session history is complete
- ✅ Metrics calculations are correct

### Scenario 6.2: Export Functionality
**Objective**: Test data export features (Pro users)

**Steps**:
1. Ensure Pro subscription
2. Navigate to analytics section
3. Test export options (PDF/CSV)
4. Verify exported data completeness
5. Check file format and readability

**Expected Results**:
- ✅ Export options available for Pro users
- ✅ Exported files contain complete data
- ✅ File formats are correct and readable
- ✅ Export process completes without errors

---

## 🌐 7. Browser Extension Testing

### Scenario 7.1: Extension Installation
**Objective**: Test browser extension installation and setup

**Steps**:
1. Load extension in developer mode
2. Verify extension appears in browser
3. Test extension popup functionality
4. Check permissions and access

**Expected Results**:
- ✅ Extension loads without errors
- ✅ Popup interface is functional
- ✅ Required permissions are granted
- ✅ Extension icon appears in toolbar

### Scenario 7.2: Real-Time Text Analysis
**Objective**: Test extension's text analysis on websites

**Steps**:
1. Navigate to Gmail, LinkedIn, or other text input site
2. Start typing in a text field
3. Observe extension's real-time analysis
4. Test improvement suggestions
5. Verify text replacement functionality

**Expected Results**:
- ✅ Extension detects text input fields
- ✅ Real-time analysis appears
- ✅ Improvement suggestions are relevant
- ✅ Text replacement works correctly

---

## 🔧 8. Error Handling and Edge Cases

### Scenario 8.1: Network Connectivity Issues
**Objective**: Test app behavior with poor/no internet

**Steps**:
1. Disconnect internet connection
2. Try to use various features
3. Reconnect and verify recovery
4. Test with slow connection

**Expected Results**:
- ✅ Graceful error messages displayed
- ✅ App doesn't crash or freeze
- ✅ Features recover when connection restored
- ✅ User data is preserved

### Scenario 8.2: Microphone Permission Issues
**Objective**: Test handling of microphone access problems

**Steps**:
1. Deny microphone permission
2. Try to start practice session
3. Grant permission and retry
4. Test with microphone disconnected

**Expected Results**:
- ✅ Clear error message when permission denied
- ✅ Instructions for enabling microphone
- ✅ Graceful recovery when permission granted
- ✅ Appropriate handling of hardware issues

### Scenario 8.3: Browser Compatibility
**Objective**: Test app functionality across different browsers

**Steps**:
1. Test in Chrome, Firefox, Safari, Edge
2. Verify core functionality in each
3. Check for browser-specific issues
4. Test responsive design on mobile browsers

**Expected Results**:
- ✅ Core features work in all major browsers
- ✅ UI renders correctly across browsers
- ✅ Voice features work where supported
- ✅ Graceful degradation for unsupported features

---

## 📱 9. Mobile Responsiveness Testing

### Scenario 9.1: Mobile Interface Testing
**Objective**: Verify app works well on mobile devices

**Steps**:
1. Open app on mobile device or use browser dev tools
2. Test navigation and touch interactions
3. Verify text input and voice features
4. Check layout and readability

**Expected Results**:
- ✅ Mobile navigation is intuitive
- ✅ Touch targets are appropriately sized
- ✅ Text is readable without zooming
- ✅ Voice features work on mobile

### Scenario 9.2: Tablet Interface Testing
**Objective**: Test app on tablet-sized screens

**Steps**:
1. Test on tablet or simulate tablet viewport
2. Verify layout adapts appropriately
3. Test both portrait and landscape orientations
4. Check feature accessibility

**Expected Results**:
- ✅ Layout optimized for tablet screens
- ✅ Features remain fully functional
- ✅ Good use of available screen space
- ✅ Smooth orientation changes

---

## 🎯 10. Performance Testing

### Scenario 10.1: Load Time Testing
**Objective**: Verify app loads quickly and efficiently

**Steps**:
1. Clear browser cache
2. Navigate to app and measure load time
3. Test with slow network simulation
4. Check for performance bottlenecks

**Expected Results**:
- ✅ Initial load completes within 3 seconds
- ✅ Subsequent navigation is fast
- ✅ No significant performance issues
- ✅ Graceful handling of slow connections

### Scenario 10.2: Memory Usage Testing
**Objective**: Test app's memory efficiency during extended use

**Steps**:
1. Use browser dev tools to monitor memory
2. Complete multiple practice sessions
3. Navigate between different features
4. Check for memory leaks

**Expected Results**:
- ✅ Memory usage remains reasonable
- ✅ No significant memory leaks detected
- ✅ App remains responsive during extended use
- ✅ Garbage collection works properly

---

## ✅ Testing Checklist

### Pre-Testing Setup
- [ ] Development server running (`npm run dev`)
- [ ] Database migrations applied
- [ ] Test user account created
- [ ] Browser dev tools open for debugging
- [ ] Microphone and speakers working

### Core Features
- [ ] User authentication (sign up/in/out)
- [ ] Navigation between all sections
- [ ] Speech practice sessions
- [ ] Real-time speech analysis
- [ ] Text assistant functionality
- [ ] Voice dictation and text-to-speech
- [ ] Subscription management
- [ ] Analytics and progress tracking

### Advanced Features
- [ ] Emotional intelligence coaching
- [ ] Real-time EI feedback
- [ ] EI dashboard analytics
- [ ] Browser extension functionality
- [ ] Multi-language support
- [ ] Export functionality

### Error Handling
- [ ] Network connectivity issues
- [ ] Microphone permission problems
- [ ] Browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance under load

### Data Integrity
- [ ] Session data saves correctly
- [ ] Progress tracking accuracy
- [ ] Subscription status persistence
- [ ] User preferences retention

---

## 🐛 Common Issues and Solutions

### Issue: Microphone Not Working
**Solutions**:
- Check browser permissions
- Verify microphone hardware
- Try different browser
- Check system audio settings

### Issue: Voice Recognition Inaccurate
**Solutions**:
- Speak more clearly and slowly
- Check language settings
- Reduce background noise
- Try different microphone

### Issue: Subscription Upgrade Fails
**Solutions**:
- Check database permissions (RLS policies)
- Verify user authentication
- Use manual SQL upgrade as fallback
- Check browser console for errors

### Issue: Real-Time Analysis Not Working
**Solutions**:
- Check JavaScript console for errors
- Verify transcript is being generated
- Ensure minimum text length threshold met
- Check component rendering conditions

---

## 📈 Success Criteria

### Functional Requirements
- ✅ All core features work as designed
- ✅ Real-time analysis provides accurate feedback
- ✅ Voice features work reliably
- ✅ Subscription system functions correctly
- ✅ Data persists across sessions

### Performance Requirements
- ✅ App loads within 3 seconds
- ✅ Real-time features respond within 1 second
- ✅ No memory leaks during extended use
- ✅ Smooth animations and transitions

### User Experience Requirements
- ✅ Intuitive navigation and interface
- ✅ Clear error messages and guidance
- ✅ Responsive design works on all devices
- ✅ Accessibility standards met

### Technical Requirements
- ✅ Cross-browser compatibility
- ✅ Secure data handling
- ✅ Proper error handling
- ✅ Scalable architecture

---

## 📝 Test Reporting

### Test Results Template
```
Test: [Scenario Name]
Date: [Date]
Tester: [Name]
Browser: [Browser/Version]
Device: [Desktop/Mobile/Tablet]

Results:
✅ Pass / ❌ Fail

Issues Found:
- [Description of any issues]

Notes:
- [Additional observations]
```

### Bug Report Template
```
Bug Title: [Brief description]
Severity: High/Medium/Low
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result: [What should happen]
Actual Result: [What actually happened]
Browser/Device: [Environment details]
Screenshots: [If applicable]
```

---

This comprehensive testing guide ensures all features of the Eloquent app are thoroughly validated through manual testing scenarios. Each scenario includes clear steps, expected results, and success criteria to maintain quality and user experience standards.