#!/usr/bin/env node

/**
 * Test Prisma Database Integration
 * Tests database connectivity and basic operations
 */

require('dotenv').config();
const prismaService = require('../services/prismaService');

async function testPrismaIntegration() {
  console.log('🗄️ Testing Prisma Database Integration');
  console.log('=====================================');
  
  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const stats = await prismaService.getFeedbackStats();
    console.log('✅ Database connected successfully');
    console.log(`📊 Current stats:`, stats);
    console.log('');

    // Test 2: Save test feedback
    console.log('2️⃣ Testing feedback save...');
    const testFeedback = {
      userPhone: '+1234567890',
      name: 'Test User',
      feedback: 'This is a test feedback for Prisma integration',
      profileImageUrl: 'test-image-url-123',
      sessionDuration: 180 // 3 minutes
    };
    
    const savedFeedback = await prismaService.saveFeedback(testFeedback);
    console.log('✅ Test feedback saved successfully');
    console.log(`📝 Feedback ID: ${savedFeedback.id}`);
    console.log('');

    // Test 3: Retrieve feedback
    console.log('3️⃣ Testing feedback retrieval...');
    const allFeedback = await prismaService.getAllFeedback({ limit: 5 });
    console.log(`✅ Retrieved ${allFeedback.length} feedback records`);
    
    if (allFeedback.length > 0) {
      console.log('📋 Latest feedback:');
      const latest = allFeedback[0];
      console.log(`   - ID: ${latest.id}`);
      console.log(`   - User: ${latest.name} (${latest.userPhone})`);
      console.log(`   - Feedback: ${latest.feedback.substring(0, 50)}...`);
      console.log(`   - Created: ${latest.createdAt}`);
    }
    console.log('');

    // Test 4: Session management
    console.log('4️⃣ Testing session management...');
    const testSession = {
      userPhone: '+9876543210',
      step: 2,
      name: 'Session Test User',
      feedback: null,
      profileImageUrl: null,
      isCompleted: false
    };
    
    const savedSession = await prismaService.saveConversationSession(testSession);
    console.log('✅ Test session saved successfully');
    
    const retrievedSession = await prismaService.getConversationSession('+9876543210');
    console.log(`✅ Session retrieved: Step ${retrievedSession.step}, Name: ${retrievedSession.name}`);
    
    // Clean up test session
    await prismaService.deleteConversationSession('+9876543210');
    console.log('✅ Test session cleaned up');
    console.log('');

    // Test 5: Updated stats
    console.log('5️⃣ Testing updated statistics...');
    const updatedStats = await prismaService.getFeedbackStats();
    console.log('✅ Updated statistics retrieved');
    console.log(`📊 Total feedback: ${updatedStats.totalFeedback}`);
    console.log(`📊 Today's feedback: ${updatedStats.todayFeedback}`);
    console.log(`📊 Active sessions: ${updatedStats.activeSessions}`);
    console.log('');

    console.log('🎉 All Prisma integration tests passed!');
    console.log('');
    console.log('💡 Your database is ready for feedback collection!');
    console.log('📊 View feedback at: http://localhost:8080/api/feedback');
    console.log('📈 View stats at: http://localhost:8080/api/feedback/stats');

  } catch (error) {
    console.error('❌ Prisma integration test failed:', error.message);
    console.error('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your database is accessible');
    console.log('3. Run: npx prisma db push');
    console.log('4. Run: npx prisma generate');
    
    process.exit(1);
  } finally {
    // Close database connection
    await prismaService.disconnect();
  }
}

testPrismaIntegration();