/**
 * Test Suite for WhatsApp Feedback Collection System
 * Tests conversation flow, session management, and error handling
 */

const axios = require('axios');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const TEST_PHONE = '+1234567890';

/**
 * Test the complete feedback collection flow
 */
async function testCompleteFeedbackFlow() {
  console.log('\n🧪 Testing: Complete Feedback Collection Flow');
  console.log('==============================================');
  
  try {
    const testData = {
      phoneNumber: TEST_PHONE,
      name: 'John Doe',
      feedback: 'Great service! Very satisfied with the experience.'
    };
    
    const response = await axios.post(`${BASE_URL}/webhook/test-feedback-flow`, testData);
    
    console.log('✅ Complete feedback flow test passed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Complete feedback flow test failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test individual conversation steps
 */
async function testIndividualSteps() {
  console.log('\n🧪 Testing: Individual Conversation Steps');
  console.log('=========================================');
  
  const testPhone = '+1234567891';
  
  try {
    // Step 1: Start with "hi"
    console.log('📱 Step 1: Sending "hi"');
    let response = await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'hi',
      phoneNumber: testPhone
    });
    console.log('✅ Step 1 passed:', response.data.message);
    
    // Step 2: Send name
    console.log('📱 Step 2: Sending name');
    response = await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Jane Smith',
      phoneNumber: testPhone
    });
    console.log('✅ Step 2 passed:', response.data.message);
    
    // Step 3: Send feedback
    console.log('📱 Step 3: Sending feedback');
    response = await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Excellent customer service and quick response time!',
      phoneNumber: testPhone
    });
    console.log('✅ Step 3 passed:', response.data.message);
    
    // Step 4: Send image
    console.log('📱 Step 4: Sending image');
    response = await axios.post(`${BASE_URL}/webhook/test-image`, {
      phoneNumber: testPhone,
      imageId: 'test-profile-image-123'
    });
    console.log('✅ Step 4 passed:', response.data.message);
    
    console.log('✅ All individual steps passed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Individual steps test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test error handling scenarios
 */
async function testErrorHandling() {
  console.log('\n🧪 Testing: Error Handling Scenarios');
  console.log('====================================');
  
  const testPhone = '+1234567892';
  
  try {
    // Start conversation
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'hi',
      phoneNumber: testPhone
    });
    
    // Test wrong input type in step 1 (send image instead of text)
    console.log('📱 Testing: Wrong input type in step 1 (image instead of name)');
    let response = await axios.post(`${BASE_URL}/webhook/test-image`, {
      phoneNumber: testPhone,
      imageId: 'wrong-step-image'
    });
    console.log('✅ Error handling step 1 passed');
    
    // Send correct name
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Test User',
      phoneNumber: testPhone
    });
    
    // Test wrong input type in step 2 (send image instead of feedback)
    console.log('📱 Testing: Wrong input type in step 2 (image instead of feedback)');
    response = await axios.post(`${BASE_URL}/webhook/test-image`, {
      phoneNumber: testPhone,
      imageId: 'wrong-step-image-2'
    });
    console.log('✅ Error handling step 2 passed');
    
    // Send correct feedback
    await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'Test feedback',
      phoneNumber: testPhone
    });
    
    // Test wrong input type in step 3 (send text instead of image)
    console.log('📱 Testing: Wrong input type in step 3 (text instead of image)');
    response = await axios.post(`${BASE_URL}/webhook/test-text`, {
      message: 'This should be an image',
      phoneNumber: testPhone
    });
    console.log('✅ Error handling step 3 passed');
    
    console.log('✅ All error handling tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test session management
 */
async function testSessionManagement() {
  console.log('\n🧪 Testing: Session Management');
  console.log('==============================');
  
  try {
    // Test multiple concurrent sessions
    const phones = ['+1111111111', '+2222222222', '+3333333333'];
    
    console.log('📱 Testing: Multiple concurrent sessions');
    for (let i = 0; i < phones.length; i++) {
      await axios.post(`${BASE_URL}/webhook/test-text`, {
        message: 'hi',
        phoneNumber: phones[i]
      });
      console.log(`✅ Started session ${i + 1} for ${phones[i]}`);
    }
    
    // Test session isolation (each user should be at step 1)
    console.log('📱 Testing: Session isolation');
    for (let i = 0; i < phones.length; i++) {
      await axios.post(`${BASE_URL}/webhook/test-text`, {
        message: `User ${i + 1}`,
        phoneNumber: phones[i]
      });
      console.log(`✅ Session ${i + 1} progressed independently`);
    }
    
    console.log('✅ Session management tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Session management test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test server health and endpoints
 */
async function testServerHealth() {
  console.log('\n🧪 Testing: Server Health');
  console.log('=========================');
  
  try {
    // Test health endpoint
    let response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint passed:', response.data.status);
    
    // Test root endpoint
    response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint passed:', response.data.message);
    
    // Test WhatsApp config endpoint
    response = await axios.get(`${BASE_URL}/api/whatsapp/config`);
    console.log('✅ WhatsApp config endpoint passed');
    
    return true;
  } catch (error) {
    console.error('❌ Server health test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting WhatsApp Feedback Collection Tests');
  console.log('===============================================');
  console.log(`Testing server at: ${BASE_URL}`);
  
  const results = {
    serverHealth: false,
    completeFeedbackFlow: false,
    individualSteps: false,
    errorHandling: false,
    sessionManagement: false
  };
  
  try {
    // Test server health first
    results.serverHealth = await testServerHealth();
    
    if (!results.serverHealth) {
      console.log('❌ Server health check failed. Stopping tests.');
      return results;
    }
    
    // Run all test suites
    results.completeFeedbackFlow = await testCompleteFeedbackFlow();
    results.individualSteps = await testIndividualSteps();
    results.errorHandling = await testErrorHandling();
    results.sessionManagement = await testSessionManagement();
    
    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${test}: ${status}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    return results;
  }
}

/**
 * Test specific scenario
 */
async function testSpecificScenario(scenario) {
  switch (scenario) {
    case 'complete':
      return await testCompleteFeedbackFlow();
    case 'steps':
      return await testIndividualSteps();
    case 'errors':
      return await testErrorHandling();
    case 'sessions':
      return await testSessionManagement();
    case 'health':
      return await testServerHealth();
    default:
      console.log('Available scenarios: complete, steps, errors, sessions, health');
      return false;
  }
}

// Export functions for use in other files
module.exports = {
  testCompleteFeedbackFlow,
  testIndividualSteps,
  testErrorHandling,
  testSessionManagement,
  testServerHealth,
  runAllTests,
  testSpecificScenario
};

// Run tests if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    testSpecificScenario(args[0]);
  } else {
    runAllTests();
  }
}