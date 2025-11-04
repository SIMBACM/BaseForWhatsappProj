const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get all trigger messages
 */
async function getAllTriggers() {
  try {
    const { data: triggers, error } = await supabase
      .from('trigger_messages')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return triggers.map(trigger => ({
      ...trigger,
      matchCount: 0,
      lastUsed: null
    }));
  } catch (error) {
    console.error('Error fetching triggers:', error);
    throw error;
  }
}

/**
 * Create a new trigger
 */
async function createTrigger(triggerData) {
  try {
    const newTrigger = {
      keyword: triggerData.keyword.toLowerCase().trim(),
      flowId: triggerData.flowId,
      message: triggerData.message || 'Please complete this form:',
      isActive: triggerData.isActive !== false
    };

    const { data, error } = await supabase
      .from('trigger_messages')
      .insert([newTrigger])
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate key')) {
        throw new Error(`Trigger with keyword "${triggerData.keyword}" already exists`);
      }
      throw error;
    }

    console.log(`✅ Created new trigger: "${data.keyword}" -> ${data.flowId}`);
    return data;
  } catch (error) {
    console.error('Error creating trigger:', error);
    throw error;
  }
}

/**
 * Update an existing trigger
 */
async function updateTrigger(id, updates) {
  try {
    if (updates.keyword) {
      updates.keyword = updates.keyword.toLowerCase().trim();
    }

    const { data, error } = await supabase
      .from('trigger_messages')
      .update({ 
        ...updates, 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated trigger ${id}:`, updates);
    return data;
  } catch (error) {
    console.error('Error updating trigger:', error);
    throw error;
  }
}

/**
 * Delete a trigger
 */
async function deleteTrigger(id) {
  try {
    const { error } = await supabase
      .from('trigger_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log(`✅ Deleted trigger with id: ${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting trigger:', error);
    throw error;
  }
}

/**
 * Find matching trigger for a message
 */
async function findMatchingTrigger(messageText) {
  try {
    const normalizedMessage = messageText.toLowerCase().trim();

    // Fetch all active triggers
    const { data: activeTriggers, error } = await supabase
      .from('trigger_messages')
      .select('*')
      .eq('isActive', true);

    if (error) throw error;

    const trigger = activeTriggers.find(t =>
      normalizedMessage.includes(t.keyword.toLowerCase())
    );

    if (trigger) {
      console.log(`🎯 Found matching trigger: "${trigger.keyword}" for message: "${messageText}"`);
      return trigger;
    }

    console.log(`📝 No matching trigger found for message: "${messageText}"`);
    return null;
  } catch (error) {
    console.error('Error finding matching trigger:', error);
    return null;
  }
}

/**
 * Initialize default triggers if table is empty
 */
async function initializeDefaultTriggers() {
  try {
    const { count, error: countError } = await supabase
      .from('trigger_messages')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count === 0) {
      console.log('🔄 Initializing default triggers...');

      const defaultTriggers = [
        {
          keyword: 'hi',
          flowId: 'onboarding_flow',
          message: 'Hi 👋 Please send your *name*.',
          isActive: true
        },
        {
          keyword: 'name_received',
          flowId: 'name_flow',
          message: 'Thanks! Please send your *feedback* 💬.',
          isActive: true
        },
        {
          keyword: 'feedback_received',
          flowId: 'feedback_flow',
          message: 'Great! Please send a *selfie* 🤳 to complete your feedback.',
          isActive: true
        },
        {
          keyword: 'selfie_received',
          flowId: 'selfie_flow',
          message: '✅ Thank you! Your feedback and selfie have been received successfully.',
          isActive: true
        }
      ];

      const { error } = await supabase
        .from('trigger_messages')
        .insert(defaultTriggers);

      if (error) throw error;

      console.log('✅ Default triggers initialized');
    }
  } catch (error) {
    console.error('Error initializing default triggers:', error);
  }
}

module.exports = {
  getAllTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  findMatchingTrigger,
  initializeDefaultTriggers
};