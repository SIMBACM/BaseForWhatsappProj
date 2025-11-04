const messageLibraryService = require('../services/messageLibraryService');

/**
 * Import triggers and messages from Excel data
 * Expected format: [["trigger1", "message1"], ["trigger2", "message2"], ...]
 */
function importTriggersAndMessages(excelData) {
  const importedMessages = [];
  const importedTriggers = [];
  
  console.log(`📊 Importing ${excelData.length} trigger-message pairs...`);
  
  excelData.forEach((row, index) => {
    const [triggerText, messageText] = row;
    
    if (!triggerText || !messageText) {
      console.warn(`⚠️  Skipping row ${index + 1}: Missing trigger or message`);
      return;
    }
    
    // Create message entry
    const messageId = `msg_excel_${index + 1}`;
    const message = {
      messageId,
      name: `Excel Import ${index + 1}: ${triggerText}`,
      type: 'standard_text',
      status: 'published',
      contentPayload: {
        body: messageText.trim()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create trigger entry
    const triggerId = `trigger_excel_${index + 1}`;
    const trigger = {
      triggerId,
      triggerType: 'keyword_match',
      triggerValue: [triggerText.toLowerCase().trim()],
      nextAction: 'send_message',
      targetId: messageId,
      messageId: messageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    importedMessages.push(message);
    importedTriggers.push(trigger);
    
    console.log(`✅ Created: "${triggerText}" → "${messageText.substring(0, 50)}..."`);
  });
  
  // Add to message library service
  messageLibraryService.messages.push(...importedMessages);
  messageLibraryService.triggers.push(...importedTriggers);
  
  console.log(`🎉 Successfully imported ${importedMessages.length} messages and ${importedTriggers.length} triggers`);
  
  return {
    messages: importedMessages,
    triggers: importedTriggers,
    summary: {
      totalMessages: importedMessages.length,
      totalTriggers: importedTriggers.length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Sample data format for testing
 */
const sampleExcelData = [
  ["hello", "Welcome to Daya Hospital! How can I help you today? 🏥"],
  ["appointment", "To book an appointment, please call us at +91-XXX-XXXX or visit our website. Our timings are 9 AM to 6 PM."],
  ["emergency", "For medical emergencies, please call our 24/7 helpline: +91-XXX-XXXX or visit our emergency department immediately."],
  ["services", "We offer: General Medicine, Cardiology, Orthopedics, Pediatrics, Gynecology, and Emergency Care. Which service do you need?"],
  ["location", "Daya Hospital is located at [Your Address]. We are easily accessible by public transport and have parking facilities."],
  ["hours", "Our hospital timings:\n🕘 OPD: 9:00 AM - 6:00 PM\n🚨 Emergency: 24/7\n📞 Phone: 9:00 AM - 8:00 PM"],
  ["doctor", "Our experienced doctors are available for consultation. Please specify which department you need: Cardiology, Orthopedics, Pediatrics, etc."],
  ["fees", "Consultation fees vary by department. Please call +91-XXX-XXXX for current fee structure or visit our reception."],
  ["reports", "Lab reports are usually ready within 24-48 hours. You can collect them from the lab or we can email them to you."],
  ["insurance", "We accept most major insurance plans. Please bring your insurance card and ID for verification during your visit."]
];

/**
 * Test the import function
 */
function testImport() {
  console.log('🧪 Testing Excel data import...');
  const result = importTriggersAndMessages(sampleExcelData);
  console.log('📋 Import Summary:', result.summary);
  return result;
}

module.exports = {
  importTriggersAndMessages,
  testImport,
  sampleExcelData
};
