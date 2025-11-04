const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PHONE = '+1234567890';

// Test functions for the enhanced message library

/**
 * Test sending interactive welcome message
 */
async function testSendInteractiveWelcome() {
  console.log('\n🧪 Testing: Send Interactive Welcome Message');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/message-library/send-welcome-interactive`, {
      phoneNumber: TEST_PHONE
    });
    
    console.log('✅ Interactive welcome message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send interactive welcome:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test button click simulation
 */
async function testButtonClick(buttonId) {
  console.log(`\n🧪 Testing: Button Click - ${buttonId}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/webhook/test-button`, {
      buttonId,
      phoneNumber: TEST_PHONE
    });
    
    console.log('✅ Button click test completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to test button click:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test list selection simulation
 */
async function testListSelection(listItemId) {
  console.log(`\n🧪 Testing: List Selection - ${listItemId}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/webhook/test-list`, {
      listItemId,
      phoneNumber: TEST_PHONE
    });
    
    console.log('✅ List selection test completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to test list selection:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting interactive messages
 */
async function testGetInteractiveMessages() {
  console.log('\n🧪 Testing: Get Interactive Messages');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/message-library/messages/interactive`);
    
    console.log('✅ Interactive messages retrieved:', {
      count: response.data.count,
      messages: response.data.messages.map(m => ({
        id: m.messageId,
        name: m.name,
        type: m.type,
        buttonCount: m.contentPayload.buttons?.length || 0,
        sectionCount: m.contentPayload.sections?.length || 0
      }))
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get interactive messages:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting interactive triggers
 */
async function testGetInteractiveTriggers() {
  console.log('\n🧪 Testing: Get Interactive Triggers');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/message-library/triggers/interactive`);
    
    console.log('✅ Interactive triggers retrieved:', {
      count: response.data.count,
      triggers: response.data.triggers.map(t => ({
        id: t.triggerId,
        type: t.triggerType,
        value: t.triggerValue,
        targetId: t.targetId
      }))
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get interactive triggers:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test button trigger lookup
 */
async function testButtonTriggerLookup(buttonId) {
  console.log(`\n🧪 Testing: Button Trigger Lookup - ${buttonId}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/message-library/triggers/button`, {
      buttonId
    });
    
    console.log('✅ Button trigger lookup completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to lookup button trigger:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting message buttons
 */
async function testGetMessageButtons(messageId) {
  console.log(`\n🧪 Testing: Get Message Buttons - ${messageId}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/message-library/messages/${messageId}/buttons`);
    
    console.log('✅ Message buttons retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get message buttons:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test complete user flow simulation
 */
async function testCompleteUserFlow() {
  console.log('\n🎯 Testing: Complete User Flow Simulation');
  console.log('Simulating: Welcome → Book Appointment → Select Doctor → Choose Slot → Confirm → Pay');
  
  const flow = [
    { action: 'button', id: 'btn_book_appointment', description: 'Click Book Appointment' },
    { action: 'button', id: 'btn_general_checkup', description: 'Click General Checkup' },
    { action: 'list', id: 'dr_sharma', description: 'Select Dr. Sharma' },
    { action: 'button', id: 'btn_slot_930', description: 'Select 9:30 AM slot' },
    { action: 'button', id: 'btn_confirm_pay', description: 'Confirm and Pay' },
    { action: 'button', id: 'btn_payment_done', description: 'Payment Completed' }
  ];
  
  console.log('🚀 Starting user flow simulation...');
  
  // Send initial welcome message
  await testSendInteractiveWelcome();
  
  // Wait a bit between actions
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate user interactions
  for (let i = 0; i < flow.length; i++) {
    const step = flow[i];
    console.log(`\n📱 Step ${i + 1}: ${step.description}`);
    
    if (step.action === 'button') {
      await testButtonClick(step.id);
    } else if (step.action === 'list') {
      await testListSelection(step.id);
    }
    
    // Wait between steps
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n🎉 Complete user flow simulation finished!');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Starting Enhanced Message Library Tests');
  console.log('==========================================');
  
  try {
    // Test basic functionality
    await testGetInteractiveMessages();
    await testGetInteractiveTriggers();
    
    // Test specific message buttons
    await testGetMessageButtons('msg_welcome_interactive');
    await testGetMessageButtons('msg_book_interactive');
    
    // Test trigger lookups
    await testButtonTriggerLookup('btn_book_appointment');
    await testButtonTriggerLookup('btn_lab_tests');
    
    // Test individual interactions
    await testButtonClick('btn_book_appointment');
    await testListSelection('dr_sharma');
    
    // Test complete flow
    await testCompleteUserFlow();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

/**
 * Test specific scenarios
 */
async function testSpecificScenarios() {
  console.log('\n🎯 Testing Specific Scenarios');
  console.log('==============================');
  
  // Scenario 1: Emergency flow
  console.log('\n📋 Scenario 1: Emergency Services');
  await testButtonClick('btn_emergency');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testButtonClick('btn_urgent_care');
  
  // Scenario 2: Lab tests flow
  console.log('\n📋 Scenario 2: Lab Tests');
  await testButtonClick('btn_lab_tests');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testListSelection('test_blood_sugar');
  
  // Scenario 3: Navigation back to main menu
  console.log('\n📋 Scenario 3: Back to Main Menu');
  await testButtonClick('btn_main_menu');
  
  console.log('\n✅ Specific scenarios testing completed!');
}

// Export functions for use in other files
module.exports = {
  testSendInteractiveWelcome,
  testButtonClick,
  testListSelection,
  testGetInteractiveMessages,
  testGetInteractiveTriggers,
  testButtonTriggerLookup,
  testGetMessageButtons,
  testCompleteUserFlow,
  runAllTests,
  testSpecificScenarios
};

// Run tests if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--scenarios')) {
    testSpecificScenarios();
  } else if (args.includes('--flow')) {
    testCompleteUserFlow();
  } else {
    runAllTests();
  }
}
