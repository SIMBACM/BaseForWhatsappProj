const { sendFlowMessage, sendTextMessage } = require('./whatsappService');
const { findMatchingTrigger } = require('./triggerService');
const messageLibraryService = require('./messageLibraryService');
const axios = require('axios');

// Supabase REST helper - backend should have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env
const supabaseRest = axios.create({
  baseURL: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/rest/v1` : null,
  headers: {
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  },
  timeout: 8000
});

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseRest.defaults.headers['apikey'] = process.env.SUPABASE_SERVICE_ROLE_KEY;
  supabaseRest.defaults.headers['Authorization'] = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
}

// Prefer using the official Supabase server SDK when available (cleaner and avoids REST quirks)
let supabaseAdmin = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
} catch (e) {
  // supabase-js not installed — we'll fallback to REST calls via axios
  supabaseAdmin = null;
}

// Helper: query contests by name fragment using ilike. Returns array or empty list on error.
async function queryContestsByNameFragment(nameFragment) {
  // Use supabase-js if available (safer)
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('contests')
        .select('contest_id,name')
        .ilike('name', `%${nameFragment}%`)
        .limit(10);
      if (error) {
        console.error('❌ Supabase SDK query error for contests by name:', { nameFragment, error });
        return [];
      }
      return data || [];
    }
  } catch (sdkErr) {
    console.error('❌ Supabase SDK threw error:', sdkErr?.message || sdkErr);
    // fall through to REST fallback
  }

  if (!supabaseRest.defaults.baseURL) return [];
  // Build query manually but encode only the fragment — keep ilike/% wrappers intact
  const encodedFragment = encodeURIComponent(nameFragment);
  const path = `/contests?select=contest_id,name&name=ilike.%${encodedFragment}%`;
  try {
    const resp = await supabaseRest.get(path);
    return resp.data || [];
  } catch (err) {
    console.error('❌ Supabase REST query error for contests by name:', {
      nameFragment,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    return [];
  }
}

/**
 * Process incoming webhook payload from WhatsApp Business API
 */
async function processWebhookPayload(payload) {

  if (payload.object !== 'whatsapp_business_account') {
    console.log('📝 Not a WhatsApp Business webhook, ignoring');
    return;
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === 'messages' && change.value.messages) {
        for (const message of change.value.messages) {
          await handleIncomingMessage(message);
        }
      }

      // Handle message status updates (delivery, read, etc.)
      if (change.field === 'messages' && change.value.statuses) {
        for (const status of change.value.statuses) {
          handleMessageStatus(status);
        }
      }
    }
  }
}

/**
 * Handle individual incoming messages
 */
async function handleIncomingMessage(message) {
  try {
    console.log(`📱 Processing message from ${message.from}:`, message);

    let messageText = '';
    
    // Extract message text based on message type
    if (message.type === 'text' && message.text) {
      messageText = message.text.body.toLowerCase().trim();
    } else if (message.type === 'interactive') {
      // Handle interactive messages (buttons, lists, flows)
      if (message.interactive.nfm_reply) {
        // Handle flow responses
        await handleFlowResponse(message);
        return;
      } else if (message.interactive.button_reply || message.interactive.list_reply) {
        // Handle button clicks and list selections
        await handleInteractiveResponse(message);
        return;
      }
    } else {
      console.log(`📝 Message type '${message.type}' not supported for triggers`);
      return;
    }

    console.log(`💬 Message text: "${messageText}"`);

    // ===== Registration flow support =====
    // We expect initial QR prefilled messages to include a marker like:
    //   REGISTER_CONTEST:<contest_id> <optional text>
    // Example prefill: "REGISTER_CONTEST:123 Welcome to \"Prize Draw\""
    // If we see that marker, create a pending participant and ask for the name.
    const regMatch = messageText.match(/register_contest:\s*(\d+)/i);
    if (regMatch) {
      const contestId = Number(regMatch[1]);
      console.log(`🆕 Detected registration start for contest ${contestId} from ${message.from}`);

      try {
        // Fetch contest info (name) if Supabase URL provided
        let contestName = 'this contest';
        if (supabaseRest.defaults.baseURL) {
          try {
            const resp = await supabaseRest.get(`/contests?contest_id=eq.${contestId}&select=name`);
            if (resp.data && resp.data.length > 0) contestName = resp.data[0].name || contestName;
          } catch (err) {
            console.warn('⚠️  Could not fetch contest name from Supabase:', err.message);
          }
        }

        // Insert pending participant (name null, validated false)
        if (supabaseRest.defaults.baseURL) {
            try {
              // participants.name is NOT NULL in the DB schema, so insert an empty string
              const insertBody = {
                contest_id: contestId,
                name: '',
                contact: message.from,
                validated: false
              };
              await supabaseRest.post('/participants', insertBody);
              console.log(`✅ Created pending participant for ${message.from} in contest ${contestId}`);
            } catch (err) {
              console.warn('⚠️  Failed to create participant via Supabase REST:', err.response?.data || err.message);
            }
        }

        // Ask for the participant's name
        const prompt = `Hi! 👋 Welcome to ${contestName}. Please reply with your full name to complete registration.`;
        try {
          await sendTextMessage(message.from, prompt);
          console.log(`📤 Sent name prompt to ${message.from}`);
        } catch (err) {
          console.error('❌ Failed to send name prompt:', err.message);
        }

        return; // handled
      } catch (err) {
        console.error('❌ Error starting registration flow:', err);
      }
    }

    // If there's an existing pending participant for this contact (name is null), treat the incoming
    // message as their name and finalize registration.
    if (supabaseRest.defaults.baseURL && messageText) {
      try {
        // Query recent participants for this contact and look for a pending row where name is empty or null
        const pendingResp = await supabaseRest.get(`/participants?contact=eq.${encodeURIComponent(message.from)}&limit=10`);
        if (pendingResp.data && pendingResp.data.length > 0) {
          const pending = pendingResp.data.find(p => p.name === null || (typeof p.name === 'string' && p.name.trim() === ''));
          if (pending) {
            const participantId = pending.participant_id || pending.id || pending.participant_id;
            const providedName = message.text?.body || messageText;

            // Update participant with name, mark validated true, add unique token
            const uniqueToken = `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            const updateBody = {
              name: providedName,
              validated: true,
              unique_token: uniqueToken
            };

            try {
              await supabaseRest.patch(`/participants?participant_id=eq.${participantId}`, updateBody);
            } catch (patchErr) {
              console.warn('⚠️  Failed to update participant:', patchErr.response?.data || patchErr.message || patchErr);
            }

            // Fetch contest name for confirmation
            let contestName = 'this contest';
            try {
              const c = await supabaseRest.get(`/contests?contest_id=eq.${pending.contest_id}&select=name`);
              if (c.data && c.data.length > 0) contestName = c.data[0].name || contestName;
            } catch (err) {
              console.warn('⚠️  Could not fetch contest name for confirmation:', err.message);
            }

            // Send confirmation
            const confirm = `Thanks ${providedName}! 🎉 You're now registered for ${contestName}. We'll notify you with further details.`;
            try {
              await sendTextMessage(message.from, confirm);
              console.log(`✅ Sent registration confirmation to ${message.from}`);
            } catch (err) {
              console.error('❌ Failed to send confirmation message:', err.message);
            }

            return; // handled
          }
        }
      } catch (err) {
        console.warn('⚠️  Error checking pending participant for contact:', err.message);
      }
    }

    // NEW: Use Message Library instead of old trigger system
    const matchingTriggers = messageLibraryService.findMatchingTriggers(messageText);
    
    if (matchingTriggers.length > 0) {
      console.log(`🎯 Found ${matchingTriggers.length} matching trigger(s)`);
      
      for (const trigger of matchingTriggers) {
        if (trigger.nextAction === 'start_registration') {
          // Trigger carries contest id in targetId
          const contestId = Number(trigger.targetId);
          console.log(`🔔 Trigger requests registration start for contest ${contestId}`);
          try {
            if (supabaseRest.defaults.baseURL) {
              await supabaseRest.post('/participants', {
                contest_id: contestId,
                name: '',
                contact: message.from,
                validated: false
              });
            }
            // Fetch contest name
            let contestName = 'this contest';
            if (supabaseRest.defaults.baseURL) {
              try {
                const r = await supabaseRest.get(`/contests?contest_id=eq.${contestId}&select=name`);
                if (r.data && r.data.length > 0) contestName = r.data[0].name || contestName;
              } catch (err) { /* ignore */ }
            }
            await sendTextMessage(message.from, `Hi! 👋 Welcome to ${contestName}. Please reply with your full name to complete registration.`);
          } catch (err) {
            console.warn('⚠️ Error handling start_registration trigger:', err.response?.data || err.message || err);
          }
          continue;
        }

        if (trigger.nextAction === 'start_registration_by_name') {
          // Trigger carries a name fragment in targetId
          const nameFragment = String(trigger.targetId || trigger.triggerValue).trim();
          console.log(`🔔 Trigger requests registration by name fragment: ${nameFragment}`);
          try {
            if (supabaseRest.defaults.baseURL) {
              const matches = await queryContestsByNameFragment(nameFragment);
              if (matches && matches.length > 0) {
                const contest = matches[0];
                // create pending participant
                try {
                  // participants.name is NOT NULL in the DB schema, so insert an empty string
                  await supabaseRest.post('/participants', {
                    contest_id: contest.contest_id,
                    name: '',
                    contact: message.from,
                    validated: false
                  });
                  const prompt = `Hi! 👋 Welcome to ${contest.name}. Please reply with your full name to complete registration.`;
                  await sendTextMessage(message.from, prompt);
                  continue;
                } catch (err) {
                  console.warn('⚠️ Failed to create pending participant via registration-by-name trigger:', err.response?.data || err.message);
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Error querying contests for registration-by-name trigger:', err.message);
          }
        }

        if (trigger.nextAction === 'send_message') {
          // Get the message from library
          const messageEntry = messageLibraryService.getMessageById(trigger.targetId);
          
          if (messageEntry && messageEntry.status === 'published') {
            console.log(`📤 Sending library message: "${messageEntry.name}" to ${message.from}`);
            
            try {
              await messageLibraryService.sendLibraryMessage(messageEntry, message.from);
              console.log(`✅ Successfully sent message "${messageEntry.name}" to ${message.from}`);
            } catch (error) {
              console.error(`❌ Failed to send message "${messageEntry.name}":`, error.message);
            }
          } else {
            console.log(`⚠️  Message ${trigger.targetId} not found or not published`);
          }
        } else if (trigger.nextAction === 'start_flow') {
          // Fallback to old flow system for flow triggers
          console.log(`🔄 Starting flow: ${trigger.targetId}`);
          await sendFlowMessage(message.from, trigger.targetId, 'Please complete this form:');
        }
      }
    } else {
      console.log(`📝 No matching triggers found for message: "${messageText}"`);
      
      // Fallback to old trigger system for backward compatibility
      const oldTrigger = findMatchingTrigger(messageText);
      if (oldTrigger && oldTrigger.isActive) {
        console.log(`🔄 Using legacy trigger: "${oldTrigger.keyword}" -> Flow: ${oldTrigger.flowId}`);
        await sendFlowMessage(message.from, oldTrigger.flowId, oldTrigger.message);
        console.log(`✅ Successfully sent legacy flow ${oldTrigger.flowId} to ${message.from}`);
      } else {
        // Additional fallback: try to infer contest from welcome message when prefill marker missing
        // e.g. messageText = 'welcome to "test2"' or 'welcome to test2'
        try {
          const welcomeMatch = messageText.match(/welcome to\s*\"?([^\"]+)\"?/i);
          if (welcomeMatch) {
            const contestNameGuess = welcomeMatch[1].trim();
            console.log(`🔎 Attempting contest lookup by name fragment: "${contestNameGuess}"`);
            if (supabaseRest.defaults.baseURL) {
              try {
                const matches = await queryContestsByNameFragment(contestNameGuess);
                if (matches && matches.length > 0) {
                  const contest = matches[0];
                  console.log(`✅ Found contest by name: ${contest.name} (${contest.contest_id}) - creating pending participant`);
                  // create pending participant
                  try {
                    await supabaseRest.post('/participants', {
                      contest_id: contest.contest_id,
                      name: '',
                      contact: message.from,
                      validated: false
                    });
                    // prompt for name
                    const prompt = `Hi! 👋 Welcome to ${contest.name}. Please reply with your full name to complete registration.`;
                    await sendTextMessage(message.from, prompt);
                    console.log(`📤 Sent name prompt to ${message.from} for contest ${contest.contest_id}`);
                    return; // handled
                  } catch (err) {
                    console.warn('⚠️ Failed to create pending participant via fallback lookup:', err.response?.data || err.message);
                  }
                } else {
                  console.log('🔍 No contest matched the guessed name');
                }
              } catch (err) {
                console.warn('⚠️ Error querying contests for fallback lookup:', err.message);
              }
            }
          }
        } catch (err) {
          console.warn('⚠️ Error during fallback contest inference:', err.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
    throw error;
  }
}

/**
 * Handle interactive message responses (buttons and lists)
 */
async function handleInteractiveResponse(message) {
  try {
    console.log(`🔘 Processing interactive response from ${message.from}:`, message.interactive);
    
    const result = messageLibraryService.processInteractiveResponse(message.interactive);
    
    if (result && result.nextMessage) {
      console.log(`📤 Sending next message: "${result.nextMessage.name}" to ${message.from}`);
      
      try {
        await messageLibraryService.sendLibraryMessage(result.nextMessage, message.from);
        console.log(`✅ Successfully sent interactive response message to ${message.from}`);
      } catch (error) {
        console.error(`❌ Failed to send interactive response message:`, error.message);
      }
    } else {
      console.log(`📝 No matching trigger found for interactive response from ${message.from}`);
      
      // Send a fallback message
      const fallbackMessage = messageLibraryService.getMessageById('msg_welcome_interactive');
      if (fallbackMessage) {
        console.log(`🔄 Sending fallback welcome message to ${message.from}`);
        await messageLibraryService.sendLibraryMessage(fallbackMessage, message.from);
      }
    }
  } catch (error) {
    console.error('❌ Error handling interactive response:', error);
  }
}

/**
 * Handle flow completion responses
 */
async function handleFlowResponse(message) {
  try {
    if (message.interactive?.nfm_reply) {
      const response = message.interactive.nfm_reply;
      
      console.log('📋 Flow response received:', {
        from: message.from,
        flowName: response.name,
        responseData: response.response_json,
        body: response.body
      });
      
      // Here you can process the flow response data
      // For example:
      // - Store response in database
      // - Trigger follow-up actions
      // - Send confirmation messages
      // - Update customer records
      
      // Example: Parse and log form data
      try {
        const formData = JSON.parse(response.response_json);
        console.log('📊 Parsed form data:', formData);
        
        // You can add custom logic here based on the form response
        
      } catch (parseError) {
        console.log('⚠️  Could not parse flow response JSON:', response.response_json);
      }
    }
  } catch (error) {
    console.error('❌ Error handling flow response:', error);
  }
}

/**
 * Handle message status updates (delivery, read, etc.)
 */
function handleMessageStatus(status) {
  console.log('📊 Message status update:', {
    messageId: status.id,
    recipientId: status.recipient_id,
    status: status.status,
    timestamp: status.timestamp
  });
}

/**
 * Simulate webhook for testing
 */
async function simulateWebhook(testMessage, phoneNumber) {
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test-entry',
      changes: [{
        field: 'messages',
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '15550617327',
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '158282837372377'
          },
          messages: [{
            id: `test-message-${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: { body: testMessage },
            type: 'text'
          }]
        }
      }]
    }]
  };

  console.log('🧪 Simulating webhook with test payload');
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Test webhook processed successfully',
    testMessage,
    phoneNumber,
    timestamp: new Date().toISOString()
  };
}

/**
 * Simulate interactive webhook for testing button/list responses
 */
async function simulateInteractiveWebhook(interactiveData, phoneNumber) {
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test-entry',
      changes: [{
        field: 'messages',
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID || '15550617327',
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '158282837372377'
          },
          messages: [{
            id: `test-interactive-${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'interactive',
            interactive: interactiveData
          }]
        }
      }]
    }]
  };

  console.log('🧪 Simulating interactive webhook with test payload');
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Test interactive webhook processed successfully',
    interactiveData,
    phoneNumber,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processWebhookPayload,
  handleIncomingMessage,
  handleInteractiveResponse,
  handleFlowResponse,
  handleMessageStatus,
  simulateWebhook,
  simulateInteractiveWebhook
};