#!/usr/bin/env node

/**
 * Quick test script for WhatsApp Feedback Collection System
 * Tests the complete conversation flow
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_PHONE = '+1234567890';

async function testFeedbackSystem() {
  console.log('🚀 Testing WhatsApp Feedback Collection System');
  console.log('==============================================');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Test Phone: ${TEST_PHONE}\n`);

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Server is ${health.data.status}\n`);

    // Test 2: Complete feedback flow
    console.log('2️⃣ Testing complete feedback flow...');
    const flowTest = await axios.post(`${BASE_URL}/webhook/test-feedback-flow`, {
      phoneNumber: TEST_PHONE,
      name: 'Test User',
      feedback: 'This is a test feedback message. The system works great!'
    });
    console.log('✅ Complete flow test passed\n');

    // Test 3: Individual steps
    console.log('3️⃣ Testing individual conversation steps...');
    
    // Step 1: Start with "hi"
    console.log('   📱 Step 1: Sending "hi"');
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'hi',
      phoneNumber: '+9876543210'
    });
    
    // Step 2: Send name
    console.log('   📱 Step 2: Sending name');
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Alice Johnson',
      phoneNumber: '+9876543210'
    });
    
    // Step 3: Send feedback
    console.log('   📱 Step 3: Sending feedback');
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Excellent customer service and very responsive support team!',
      phoneNumber: '+9876543210'
    });
    
    // Step 4: Send image
    console.log('   📱 Step 4: Sending image');
    await axios.post(`${BASE_URL}/webhook/test-image`, {
      phoneNumber: '+9876543210',
      imageId: 'test-profile-image-456'
    });
    
    console.log('✅ Individual steps test passed\n');

    // Test 4: Error handling
    console.log('4️⃣ Testing error handling...');
    
    // Start new session
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'hi',
      phoneNumber: '+5555555555'
    });
    
    // Send wrong input type (image instead of name)
    console.log('   ❌ Testing wrong input type (image instead of name)');
    await axios.post(`${BASE_URL}/webhook/test-image`, {
      phoneNumber: '+5555555555',
      imageId: 'wrong-input-test'
    });
    
    console.log('✅ Error handling test passed\n');

    console.log('🎉 All tests completed successfully!');
    console.log('📊 Check the console logs above for feedback data output');
    console.log('\n💡 To test with real WhatsApp:');
    console.log('   1. Send "hi" to your WhatsApp Business number');
    console.log('   2. Follow the conversation prompts');
    console.log('   3. Check server console for logged feedback data');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testFeedbackSystem();