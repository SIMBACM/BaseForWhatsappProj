const { sendTextMessage } = require('./whatsappService');
const conversationManager = require('./conversationManager');
const { getTemplate } = require('../utils/messageTemplates');
const supabaseStorageService = require('./supabaseStorageService');

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
 * Handle individual incoming messages for feedback collection
 */
async function handleIncomingMessage(message) {
  try {
    console.log(`📱 Processing message from ${message.from}:`, message);

    const userPhone = message.from;
    
    // Handle "hi" trigger to start feedback flow
    if (message.type === 'text' && message.text) {
      const messageText = message.text.body.toLowerCase().trim();
      
      if (messageText === 'hi') {
        console.log(`👋 Starting feedback collection for ${userPhone}`);
        const session = await conversationManager.createSession(userPhone);
        const response = getTemplate('greeting');
        await sendTextMessage(userPhone, response);
        return;
      }
    }

    // Get current session
    const session = await conversationManager.getSession(userPhone);
    
    // Process message based on current conversation step
    switch (session.step) {
      case 1:
        await handleNameCollection(message, userPhone, session);
        break;
      case 2:
        await handleFeedbackCollection(message, userPhone, session);
        break;
      case 3:
        await handleImageCollection(message, userPhone, session);
        break;
      default:
        // Invalid step, reset to beginning
        console.log(`❌ Invalid step ${session.step} for ${userPhone}, resetting`);
        await conversationManager.resetSession(userPhone);
        const response = getTemplate('greeting');
        await sendTextMessage(userPhone, response);
    }
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
    
    // Send error message to user
    try {
      const errorResponse = getTemplate('systemError');
      await sendTextMessage(message.from, errorResponse);
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
    
    throw error;
  }
}

/**
 * Handle name collection (Step 1 → Step 2)
 */
async function handleNameCollection(message, userPhone, session) {
  if (message.type !== 'text' || !message.text) {
    // Wrong input type - expect text
    const response = getTemplate('needText');
    await sendTextMessage(userPhone, response);
    return;
  }

  const name = message.text.body.trim();
  console.log(`📝 Collected name: "${name}" from ${userPhone}`);
  
  // Update session with name and advance to step 2
  await conversationManager.updateSession(userPhone, { name });
  await conversationManager.advanceStep(userPhone);
  
  // Send personalized response
  const response = getTemplate('nameReceived', name);
  await sendTextMessage(userPhone, response);
}

/**
 * Handle feedback collection (Step 2 → Step 3)
 */
async function handleFeedbackCollection(message, userPhone, session) {
  if (message.type !== 'text' || !message.text) {
    // Wrong input type - expect text
    const response = getTemplate('needText');
    await sendTextMessage(userPhone, response);
    return;
  }

  const feedback = message.text.body.trim();
  console.log(`💬 Collected feedback: "${feedback.substring(0, 50)}..." from ${userPhone}`);
  
  // Update session with feedback and advance to step 3
  await conversationManager.updateSession(userPhone, { feedback });
  await conversationManager.advanceStep(userPhone);
  
  // Ask for profile picture
  const response = getTemplate('feedbackReceived');
  await sendTextMessage(userPhone, response);
}

/**
 * Handle image collection (Step 3 → Complete)
 */
async function handleImageCollection(message, userPhone, session) {
  if (message.type !== 'image' || !message.image) {
    // Wrong input type - expect image
    const response = getTemplate('needImage');
    await sendTextMessage(userPhone, response);
    return;
  }

  const whatsappImageId = message.image.id; // WhatsApp image ID
  console.log(`📸 Collected image: ${whatsappImageId} from ${userPhone}`);
  
  // Update session with WhatsApp image ID first
  await conversationManager.updateSession(userPhone, { 
    whatsappImageId: whatsappImageId,
    profileImageUrl: null // Will be updated after Supabase upload
  });
  
  // Send immediate response to user
  const response = getTemplate('completed', session.name);
  await sendTextMessage(userPhone, response);
  
  // Process image upload in background (don't wait for completion)
  processImageUploadAsync(whatsappImageId, userPhone, session);
}

/**
 * Process image upload to Supabase Storage asynchronously
 * This runs in the background after user receives completion message
 */
async function processImageUploadAsync(whatsappImageId, userPhone, session) {
  try {
    console.log(`🔄 Starting background image processing for ${userPhone}`);
    
    // Complete the session first (this creates the feedback record)
    const completedSession = await conversationManager.completeSession(userPhone);
    
    if (!completedSession) {
      console.error(`❌ No session found to complete for ${userPhone}`);
      return;
    }
    
    // Get the feedback ID from the database (we need this for the filename)
    const prismaService = require('./prismaService');
    const recentFeedback = await prismaService.prisma.feedback.findFirst({
      where: {
        userPhone: userPhone
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!recentFeedback) {
      console.error(`❌ No feedback record found for ${userPhone}`);
      return;
    }
    
    // Upload image to Supabase Storage
    console.log(`📤 Uploading image to Supabase for feedback ID: ${recentFeedback.id}`);
    const uploadResult = await supabaseStorageService.uploadWhatsAppImage(
      whatsappImageId, 
      userPhone, 
      recentFeedback.id
    );
    
    if (uploadResult.success) {
      // Update feedback record with Supabase image URL
      await prismaService.prisma.feedback.update({
        where: {
          id: recentFeedback.id
        },
        data: {
          profileImageUrl: uploadResult.publicUrl,
          whatsappImageId: whatsappImageId,
          imageStoragePath: uploadResult.filePath
        }
      });
      
      console.log(`✅ Image processing completed for ${userPhone}: ${uploadResult.publicUrl}`);
    } else {
      console.error(`❌ Image upload failed for ${userPhone}:`, uploadResult.error);
      
      // Update feedback record with error info
      await prismaService.prisma.feedback.update({
        where: {
          id: recentFeedback.id
        },
        data: {
          whatsappImageId: whatsappImageId,
          profileImageUrl: `error: ${uploadResult.error}`
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ Error in background image processing for ${userPhone}:`, error);
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
 * Simulate webhook for testing feedback collection
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

  console.log('🧪 Simulating feedback collection webhook');
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Feedback collection test completed',
    testMessage,
    phoneNumber,
    timestamp: new Date().toISOString()
  };
}

/**
 * Simulate image message for testing
 */
async function simulateImageWebhook(phoneNumber, imageId = 'test-image-123') {
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
            id: `test-image-${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'image',
            image: { id: imageId }
          }]
        }
      }]
    }]
  };

  console.log('🧪 Simulating image webhook');
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Image webhook test completed',
    phoneNumber,
    imageId,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processWebhookPayload,
  handleIncomingMessage,
  handleMessageStatus,
  simulateWebhook,
  simulateImageWebhook
};