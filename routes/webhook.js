const express = require('express');
const crypto = require('crypto');
const { processWebhookPayload, simulateWebhook, simulateImageWebhook } = require('../services/webhookService');

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

// Test webhook endpoints for feedback collection

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

// Test image message webhook
router.post('/test-image', async (req, res) => {
  try {
    const { phoneNumber, imageId } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }
    
    const result = await simulateImageWebhook(phoneNumber, imageId);
    res.json({
      success: true,
      message: 'Image webhook test completed',
      phoneNumber,
      imageId: imageId || 'test-image-123',
      result
    });
  } catch (error) {
    console.error('Error testing image webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test complete feedback flow
router.post('/test-feedback-flow', async (req, res) => {
  try {
    const { phoneNumber, name, feedback } = req.body;
    
    if (!phoneNumber || !name || !feedback) {
      return res.status(400).json({ 
        error: 'phoneNumber, name, and feedback are required' 
      });
    }
    
    console.log(`🧪 Testing complete feedback flow for ${phoneNumber}`);
    
    // Step 1: Start with "hi"
    await simulateWebhook('hi', phoneNumber);
    
    // Step 2: Send name
    await simulateWebhook(name, phoneNumber);
    
    // Step 3: Send feedback
    await simulateWebhook(feedback, phoneNumber);
    
    // Step 4: Send image
    await simulateImageWebhook(phoneNumber, 'test-profile-image');
    
    res.json({
      success: true,
      message: 'Complete feedback flow test completed',
      phoneNumber,
      name,
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing feedback flow:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;