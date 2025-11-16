// Quick EI Feature Test - Run in browser console
// This will upgrade you to Pro and test the EI feature

console.log('🎭 Quick EI Feature Test Starting...');

// Step 1: Upgrade current user to Pro
async function quickUpgradeToPro() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Please sign in first');
      return false;
    }
    
    console.log('👤 Current user:', user.email);
    
    // Try to upgrade to Pro
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_name: 'pro',
        status: 'active',
        cancel_at_period_end: false
      }, { onConflict: 'user_id' })
      .select();
    
    if (error) {
      console.log('❌ Upgrade failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully upgraded to Pro!');
    return true;
  } catch (error) {
    console.log('❌ Error during upgrade:', error.message);
    return false;
  }
}

// Step 2: Test EI Feature Access
async function testEIAccess() {
  console.log('🧪 Testing EI feature access...');
  
  // Navigate to EI dashboard (simulate)
  console.log('📊 EI Dashboard should now show full features');
  console.log('🎯 Go to the "Emotional IQ" tab to see the dashboard');
  
  // Test practice session with EI
  console.log('🎤 To test real-time EI coaching:');
  console.log('1. Go to Practice tab');
  console.log('2. Start a practice session');
  console.log('3. Allow microphone access');
  console.log('4. Start speaking - you should see the EI coach panel');
  
  return true;
}

// Step 3: Create sample EI data for testing
async function createSampleEIData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('📝 Creating sample EI data...');
    
    // Create a few sample practice sessions with EI data
    const sampleSessions = [
      {
        transcript: "I am absolutely confident that this solution will definitely work. I'm excited about this amazing opportunity!",
        confidence_level: 90,
        energy_level: 'high',
        anxiety_score: 2,
        positivity_score: 95,
        emotional_tone: 'confident-energetic'
      },
      {
        transcript: "Um, I think maybe this might work, I guess. I'm not really sure about it, you know?",
        confidence_level: 35,
        energy_level: 'low',
        anxiety_score: 8,
        positivity_score: 40,
        emotional_tone: 'anxious'
      },
      {
        transcript: "This is a great project and I believe we can achieve excellent results with our team.",
        confidence_level: 75,
        energy_level: 'moderate',
        anxiety_score: 3,
        positivity_score: 85,
        emotional_tone: 'positive'
      }
    ];
    
    for (let i = 0; i < sampleSessions.length; i++) {
      const session = sampleSessions[i];
      
      // Create practice session
      const { data: practiceSession, error: practiceError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          transcript: session.transcript,
          fluency_score: session.confidence_level,
          confidence_level: session.confidence_level,
          energy_level: session.energy_level,
          anxiety_score: session.anxiety_score,
          positivity_score: session.positivity_score,
          emotional_tone: session.emotional_tone,
          duration: 30 + Math.random() * 60 // Random duration 30-90 seconds
        })
        .select()
        .single();
      
      if (practiceError) {
        console.log(`❌ Failed to create practice session ${i + 1}:`, practiceError.message);
        continue;
      }
      
      // Create EI session
      const { error: eiError } = await supabase
        .from('emotional_intelligence_sessions')
        .insert({
          practice_session_id: practiceSession.id,
          user_id: user.id,
          confidence_level: session.confidence_level,
          energy_level: session.energy_level,
          anxiety_score: session.anxiety_score,
          positivity_score: session.positivity_score,
          emotional_tone: session.emotional_tone,
          overall_ei_score: Math.round((session.confidence_level + session.positivity_score + Math.max(0, 100 - session.anxiety_score * 10)) / 3)
        });
      
      if (eiError) {
        console.log(`⚠️ EI session creation failed for session ${i + 1}:`, eiError.message);
      } else {
        console.log(`✅ Created sample session ${i + 1} with EI data`);
      }
    }
    
    console.log('📊 Sample data created! Refresh the EI dashboard to see charts.');
    return true;
  } catch (error) {
    console.log('❌ Error creating sample data:', error.message);
    return false;
  }
}

// Run the complete test
async function runCompleteEITest() {
  console.log('🚀 Starting complete EI feature test...\n');
  
  const upgraded = await quickUpgradeToPro();
  if (!upgraded) {
    console.log('❌ Cannot continue without Pro upgrade');
    return;
  }
  
  await testEIAccess();
  await createSampleEIData();
  
  console.log('\n🎉 EI Feature Test Complete!');
  console.log('📋 Next steps:');
  console.log('1. Refresh your browser page');
  console.log('2. Go to "Emotional IQ" tab - should show full dashboard');
  console.log('3. Go to "Practice" tab and start speaking to test real-time EI coaching');
  console.log('4. Check the charts and analytics in the EI dashboard');
}

// Auto-run the test
runCompleteEITest();