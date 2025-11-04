// In-memory storage for triggers (use a database in production)
let triggers = [
  {
    id: '1',
    keyword: 'hello',
    flowId: 'your_flow_id_here',
    message: 'Hello! Please complete this form:',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    keyword: 'register',
    flowId: 'your_registration_flow_id',
    message: 'Please complete your registration:',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

/**
 * Get all triggers
 */
function getAllTriggers() {
  return triggers.map(trigger => ({
    ...trigger,
    // Add computed properties
    matchCount: 0, // In production, you'd track this
    lastUsed: null   // In production, you'd track this
  }));
}

/**
 * Create a new trigger
 */
function createTrigger(triggerData) {
  const newTrigger = {
    id: Date.now().toString(),
    keyword: triggerData.keyword.toLowerCase().trim(),
    flowId: triggerData.flowId,
    message: triggerData.message || 'Please complete this form:',
    isActive: triggerData.isActive !== false, // Default to true
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Validate required fields
  if (!newTrigger.keyword || !newTrigger.flowId) {
    throw new Error('Keyword and flowId are required');
  }

  // Check for duplicate keywords
  const existingTrigger = triggers.find(t => 
    t.keyword.toLowerCase() === newTrigger.keyword.toLowerCase()
  );
  
  if (existingTrigger) {
    throw new Error(`Trigger with keyword "${newTrigger.keyword}" already exists`);
  }

  triggers.push(newTrigger);
  
  console.log(`✅ Created new trigger: "${newTrigger.keyword}" -> ${newTrigger.flowId}`);
  
  return newTrigger;
}

/**
 * Update an existing trigger
 */
function updateTrigger(id, updates) {
  const index = triggers.findIndex(t => t.id === id);
  
  if (index === -1) {
    return null;
  }

  // Validate keyword uniqueness if keyword is being updated
  if (updates.keyword) {
    const normalizedKeyword = updates.keyword.toLowerCase().trim();
    const existingTrigger = triggers.find(t => 
      t.id !== id && t.keyword.toLowerCase() === normalizedKeyword
    );
    
    if (existingTrigger) {
      throw new Error(`Trigger with keyword "${normalizedKeyword}" already exists`);
    }
    
    updates.keyword = normalizedKeyword;
  }

  triggers[index] = {
    ...triggers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  console.log(`✅ Updated trigger ${id}:`, updates);
  
  return triggers[index];
}

/**
 * Delete a trigger
 */
function deleteTrigger(id) {
  const index = triggers.findIndex(t => t.id === id);
  
  if (index === -1) {
    return false;
  }

  const deletedTrigger = triggers.splice(index, 1)[0];
  
  console.log(`✅ Deleted trigger: "${deletedTrigger.keyword}"`);
  
  return true;
}

/**
 * Find matching trigger for a message
 */
function findMatchingTrigger(messageText) {
  const normalizedMessage = messageText.toLowerCase().trim();
  
  // Find triggers that match the message text
  const matchingTriggers = triggers.filter(trigger => 
    trigger.isActive && normalizedMessage.includes(trigger.keyword.toLowerCase())
  );

  // Return the first matching trigger (you could implement priority logic here)
  if (matchingTriggers.length > 0) {
    const trigger = matchingTriggers[0];
    console.log(`🎯 Found matching trigger: "${trigger.keyword}" for message: "${messageText}"`);
    
    return trigger;
  }

  console.log(`📝 No matching trigger found for message: "${messageText}"`);
  return null;
}

/**
 * Test trigger matching without actually sending
 */
async function testTrigger(message, phoneNumber) {
  const { simulateWebhook } = require('./webhookService');
  
  console.log(`🧪 Testing trigger with message: "${message}"`);
  
  const matchingTrigger = findMatchingTrigger(message);
  
  const result = {
    message,
    phoneNumber,
    matchingTrigger: matchingTrigger ? {
      id: matchingTrigger.id,
      keyword: matchingTrigger.keyword,
      flowId: matchingTrigger.flowId,
      message: matchingTrigger.message
    } : null,
    allActiveTriggers: triggers.filter(t => t.isActive).map(t => ({
      keyword: t.keyword,
      flowId: t.flowId
    })),
    timestamp: new Date().toISOString()
  };

  // Simulate the full webhook flow
  if (matchingTrigger) {
    try {
      await simulateWebhook(message, phoneNumber);
      result.simulationResult = 'success';
    } catch (error) {
      result.simulationResult = 'error';
      result.simulationError = error.message;
    }
  }

  return result;
}

module.exports = {
  getAllTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  findMatchingTrigger,
  testTrigger
};