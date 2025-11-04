const express = require('express');
const { sendFlowMessage, sendTextMessage, testWhatsAppConnection } = require('../services/whatsappService');

const router = express.Router();

// Test WhatsApp connection
router.get('/test', async (req, res) => {
  try {
    const result = await testWhatsAppConnection();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('WhatsApp connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'WhatsApp connection test failed',
      details: error.message
    });
  }
});

// Send flow message manually
router.post('/send-flow', async (req, res) => {
  try {
    const { phoneNumber, flowId, message } = req.body;

    if (!phoneNumber || !flowId) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and flowId are required'
      });
    }

    const result = await sendFlowMessage(phoneNumber, flowId, message);

    res.json({
      success: true,
      data: result,
      message: 'Flow sent successfully'
    });
  } catch (error) {
    console.error('Error sending flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send flow',
      details: error.message
    });
  }
});

// Send plain text message (uses service role on backend)
router.post('/send-text', async (req, res) => {
  try {
    const { phoneNumber, text } = req.body;

    if (!phoneNumber || !text) {
      return res.status(400).json({ success: false, error: 'phoneNumber and text are required' });
    }

    const result = await sendTextMessage(phoneNumber, text);

    res.json({ success: true, data: result, message: 'Text message sent' });
  } catch (error) {
    console.error('Error sending text message:', error);
    res.status(500).json({ success: false, error: 'Failed to send text message', details: error.message });
  }
});

// Get WhatsApp configuration status
router.get('/config', (req, res) => {
  const config = {
    hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    hasBusinessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 
      process.env.WHATSAPP_PHONE_NUMBER_ID.substring(0, 4) + '***' : null
  };

  res.json({
    success: true,
    data: config,
    isConfigured: config.hasAccessToken && config.hasPhoneNumberId && config.hasBusinessAccountId
  });
});

// Register new flow and auto-create trigger
router.post('/register-flow', (req, res) => {
  try {
    const { flowId, flowName, activationMessage, autoCreateTrigger = true } = req.body;

    if (!flowId || !activationMessage) {
      return res.status(400).json({
        success: false,
        error: 'flowId and activationMessage are required'
      });
    }

    // If auto-create trigger is enabled, create a webhook trigger
    if (autoCreateTrigger) {
      const { createTrigger } = require('../services/triggerService');
      
      try {
        const trigger = createTrigger({
          keyword: activationMessage.toLowerCase().trim(),
          flowId: flowId,
          message: `Hello! Please complete this ${flowName || 'form'}:`,
          isActive: true
        });

        console.log(`✅ Auto-created trigger for flow ${flowId}: "${activationMessage}" -> ${flowName || flowId}`);
        
        res.json({
          success: true,
          data: {
            flowId,
            flowName,
            activationMessage,
            trigger: trigger
          },
          message: `Flow registered successfully! Trigger created for keyword "${activationMessage}"`
        });
      } catch (triggerError) {
        console.error('Error creating auto-trigger:', triggerError);
        
        // Flow registration succeeded, but trigger creation failed
        res.json({
          success: true,
          data: {
            flowId,
            flowName,
            activationMessage,
            trigger: null
          },
          message: 'Flow registered successfully, but trigger creation failed',
          warning: triggerError.message
        });
      }
    } else {
      res.json({
        success: true,
        data: {
          flowId,
          flowName,
          activationMessage,
          trigger: null
        },
        message: 'Flow registered successfully (no trigger created)'
      });
    }
  } catch (error) {
    console.error('Error registering flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register flow',
      details: error.message
    });
  }
});

module.exports = router;