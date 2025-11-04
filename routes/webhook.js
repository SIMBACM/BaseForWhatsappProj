const express = require('express');
const crypto = require('crypto');
const { processWebhookPayload, simulateWebhook, simulateInteractiveWebhook } = require('../services/webhookService');

const router = express.Router();

// Webhook verification endpoint (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification request:', { mode, token: token ? '***' : 'missing', challenge });

  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('❌ WEBHOOK_VERIFY_TOKEN not configured');
    return res.status(500).send('Server configuration error');
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed:', {
      expectedToken: verifyToken,
      receivedToken: token,
      mode
    });
    res.status(403).send('Verification failed');
  }
});

// Webhook message processing endpoint (POST)
router.post('/', async (req, res) => {
  const body = req.body;
  const signature = req.headers['x-hub-signature-256'];

  console.log('📨 Webhook payload received');

  // Verify request signature (recommended for security)
  if (process.env.WEBHOOK_APP_SECRET) {
    if (!signature) {
      console.error('❌ Missing webhook signature');
      return res.status(401).send('Unauthorized - Missing signature');
    }

    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', process.env.WEBHOOK_APP_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).send('Unauthorized - Invalid signature');
    }
    
    console.log('✅ Webhook signature verified');
  } else {
    console.warn('⚠️  Webhook signature verification disabled (WEBHOOK_APP_SECRET not set)');
  }

  try {
    await processWebhookPayload(body);
    console.log('✅ Webhook processed successfully');
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Test webhook endpoints

// Test text message webhook
router.post('/test-text', async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    
    if (!message || !phoneNumber) {
      return res.status(400).json({ error: 'message and phoneNumber are required' });
    }
    
    const result = await simulateWebhook(message, phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error testing text webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test interactive message webhook (button clicks)
router.post('/test-interactive', async (req, res) => {
  try {
    const { interactiveData, phoneNumber } = req.body;
    
    if (!interactiveData || !phoneNumber) {
      return res.status(400).json({ error: 'interactiveData and phoneNumber are required' });
    }
    
    const result = await simulateInteractiveWebhook(interactiveData, phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error testing interactive webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test button click webhook
router.post('/test-button', async (req, res) => {
  try {
    const { buttonId, phoneNumber } = req.body;
    
    if (!buttonId || !phoneNumber) {
      return res.status(400).json({ error: 'buttonId and phoneNumber are required' });
    }
    
    const interactiveData = {
      type: 'button_reply',
      button_reply: {
        id: buttonId,
        title: 'Test Button'
      }
    };
    
    const result = await simulateInteractiveWebhook(interactiveData, phoneNumber);
    res.json({
      success: true,
      message: 'Button click webhook test completed',
      buttonId,
      phoneNumber,
      result
    });
  } catch (error) {
    console.error('Error testing button webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test list selection webhook
router.post('/test-list', async (req, res) => {
  try {
    const { listItemId, phoneNumber } = req.body;
    
    if (!listItemId || !phoneNumber) {
      return res.status(400).json({ error: 'listItemId and phoneNumber are required' });
    }
    
    const interactiveData = {
      type: 'list_reply',
      list_reply: {
        id: listItemId,
        title: 'Test List Item'
      }
    };
    
    const result = await simulateInteractiveWebhook(interactiveData, phoneNumber);
    res.json({
      success: true,
      message: 'List selection webhook test completed',
      listItemId,
      phoneNumber,
      result
    });
  } catch (error) {
    console.error('Error testing list webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;