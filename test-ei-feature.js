// Test script for Emotional Intelligence feature
// Run this in your browser console after signing in

async function testEIFeature() {
  console.log('🎭 Testing Emotional Intelligence Feature...');
  
  // Test 1: Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ User not authenticated');
    return;
  }
  console.log('✅ User authenticated:', user.email);
  
  // Test 2: Check subscription status
  try {
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subError) {
      console.error('❌ Subscription check failed:', subError);
    } else {
      console.log('✅ Subscription status:', subscription?.plan_name || 'No subscription found');
    }
  } catch (error) {
    console.error('❌ Subscription table might not exist:', error);
  }
  
  // Test 3: Check if EI tables exist
  try {
    const { data: eiSessions, error: eiError } = await supabase
      .from('emotional_intelligence_sessions')
      .select('count')
      .eq('user_id', user.id);
    
    if (eiError) {
      console.error('❌ EI sessions table check failed:', eiError);
    } else {
      console.log('✅ EI sessions table exists');
    }
  } catch (error) {
    console.error('❌ EI tables might not exist:', error);
  }
  
  // Test 4: Test EI analysis function
  const testTranscript = "I am absolutely confident that this solution will definitely work. I'm excited about this amazing opportunity!";
  
  console.log('🧪 Testing EI analysis with sample text...');
  console.log('Sample text:', testTranscript);
  
  // Simulate the analysis (this would normally happen in the EmotionalIntelligenceCoach component)
  const words = testTranscript.toLowerCase().split(/\s+/);
  const confidenceWords = ['absolutely', 'confident', 'definitely', 'excited', 'amazing'];
  const foundConfidenceWords = words.filter(word => confidenceWords.includes(word));
  
  console.log('✅ Found confidence words:', foundConfidenceWords);
  console.log('✅ Estimated confidence level:', Math.min(100, 50 + foundConfidenceWords.length * 15));
  
  // Test 5: Create a test EI session (if tables exist)
  try {
    const { data: testSession, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        transcript: testTranscript,
        fluency_score: 85,
        confidence_level: 90,
        energy_level: 'high',
        anxiety_score: 2,
        positivity_score: 95,
        emotional_tone: 'confident-energetic'
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Test session creation failed:', sessionError);
    } else {
      console.log('✅ Test practice session created:', testSession.id);
      
      // Create corresponding EI session
      const { data: eiSession, error: eiSessionError } = await supabase
        .from('emotional_intelligence_sessions')
        .insert({
          practice_session_id: testSession.id,
          user_id: user.id,
          confidence_level: 90,
          energy_level: 'high',
          anxiety_score: 2,
          positivity_score: 95,
          emotional_tone: 'confident-energetic',
          overall_ei_score: 88
        })
        .select()
        .single();
      
      if (eiSessionError) {
        console.error('❌ EI session creation failed:', eiSessionError);
      } else {
        console.log('✅ Test EI session created:', eiSession.id);
      }
    }
  } catch (error) {
    console.error('❌ Test data creation failed:', error);
  }
  
  console.log('🎭 EI Feature test completed!');
}

// Upgrade user to Pro for testing
async function upgradeToProForTesting() {
  console.log('🚀 Upgrading to Pro for testing...');
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ User not authenticated');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_name: 'pro',
        status: 'active',
        cancel_at_period_end: false
      }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Pro upgrade failed:', error);
    } else {
      console.log('✅ Successfully upgraded to Pro!', data);
      console.log('🔄 Refresh the page to see Pro features');
    }
  } catch (error) {
    console.error('❌ Unexpected error during upgrade:', error);
  }
}

// Run the tests
console.log('🎭 Emotional Intelligence Testing Suite');
console.log('Run testEIFeature() to test the EI feature');
console.log('Run upgradeToProForTesting() to upgrade to Pro plan');

// Auto-run basic test
testEIFeature();