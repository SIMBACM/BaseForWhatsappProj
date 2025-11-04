const express = require('express');
const messageLibraryService = require('../services/messageLibraryService');
const { importTriggersAndMessages, testImport } = require('../utils/importExcelData');

const router = express.Router();

// Get all published messages
router.get('/messages/published', (req, res) => {
  try {
    const publishedMessages = messageLibraryService.getPublishedMessages();
    res.json(publishedMessages);
  } catch (error) {
    console.error('Error getting published messages:', error);
    res.status(500).json({ error: 'Failed to get published messages' });
  }
});

// Get all messages
router.get('/messages', (req, res) => {
  try {
    const messages = messageLibraryService.messages;
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get message by ID
router.get('/messages/:messageId', (req, res) => {
  try {
    const message = messageLibraryService.getMessageById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

// Create new message
router.post('/messages', (req, res) => {
  try {
    const newMessage = messageLibraryService.addMessage(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Update message
router.put('/messages/:messageId', (req, res) => {
  try {
    const messageId = req.params.messageId;
    const messageIndex = messageLibraryService.messages.findIndex(m => m.messageId === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    messageLibraryService.messages[messageIndex] = {
      ...messageLibraryService.messages[messageIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(messageLibraryService.messages[messageIndex]);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/messages/:messageId', (req, res) => {
  try {
    const messageId = req.params.messageId;
    const messageIndex = messageLibraryService.messages.findIndex(m => m.messageId === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    messageLibraryService.messages.splice(messageIndex, 1);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Publish message
router.post('/messages/:messageId/publish', (req, res) => {
  try {
    const messageId = req.params.messageId;
    const messageIndex = messageLibraryService.messages.findIndex(m => m.messageId === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    messageLibraryService.messages[messageIndex].status = 'published';
    messageLibraryService.messages[messageIndex].updatedAt = new Date().toISOString();
    
    res.json(messageLibraryService.messages[messageIndex]);
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).json({ error: 'Failed to publish message' });
  }
});

// Unpublish message
router.post('/messages/:messageId/unpublish', (req, res) => {
  try {
    const messageId = req.params.messageId;
    const messageIndex = messageLibraryService.messages.findIndex(m => m.messageId === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    messageLibraryService.messages[messageIndex].status = 'draft';
    messageLibraryService.messages[messageIndex].updatedAt = new Date().toISOString();
    
    res.json(messageLibraryService.messages[messageIndex]);
  } catch (error) {
    console.error('Error unpublishing message:', error);
    res.status(500).json({ error: 'Failed to unpublish message' });
  }
});

// Get all triggers
router.get('/triggers', (req, res) => {
  try {
    const triggers = messageLibraryService.triggers;
    res.json(triggers);
  } catch (error) {
    console.error('Error getting triggers:', error);
    res.status(500).json({ error: 'Failed to get triggers' });
  }
});

// Get triggers by message ID
router.get('/triggers/message/:messageId', (req, res) => {
  try {
    const triggers = messageLibraryService.triggers.filter(t => t.messageId === req.params.messageId);
    res.json(triggers);
  } catch (error) {
    console.error('Error getting triggers:', error);
    res.status(500).json({ error: 'Failed to get triggers' });
  }
});

// Create new trigger
router.post('/triggers', (req, res) => {
  try {
    const newTrigger = messageLibraryService.addTrigger(req.body);
    res.status(201).json(newTrigger);
  } catch (error) {
    console.error('Error creating trigger:', error);
    res.status(500).json({ error: 'Failed to create trigger' });
  }
});

// Find matching triggers (for webhook processing)
router.post('/triggers/match', (req, res) => {
  try {
    const { messageText, phoneNumber } = req.body;
    const matchingTriggers = messageLibraryService.findMatchingTriggers(messageText);
    
    res.json({
      messageText,
      phoneNumber,
      matchingTriggers,
      count: matchingTriggers.length
    });
  } catch (error) {
    console.error('Error finding matching triggers:', error);
    res.status(500).json({ error: 'Failed to find matching triggers' });
  }
});

// Test message sending
router.post('/test-send', async (req, res) => {
  try {
    const { messageId, phoneNumber } = req.body;
    
    if (!messageId || !phoneNumber) {
      return res.status(400).json({ error: 'messageId and phoneNumber are required' });
    }
    
    const message = messageLibraryService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    const result = await messageLibraryService.sendLibraryMessage(message, phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export/import data
router.get('/export', (req, res) => {
  try {
    const data = {
      messages: messageLibraryService.messages,
      triggers: messageLibraryService.triggers
    };
    res.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.post('/import', (req, res) => {
  try {
    const { messages, triggers } = req.body;
    
    if (messages) {
      messageLibraryService.messages = messages;
    }
    
    if (triggers) {
      messageLibraryService.triggers = triggers;
    }
    
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Import Excel data (triggers and messages)
router.post('/import-excel', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ 
        error: 'Invalid data format. Expected array of [trigger, message] pairs.' 
      });
    }
    
    const result = importTriggersAndMessages(data);
    res.json({
      success: true,
      message: 'Excel data imported successfully',
      ...result
    });
  } catch (error) {
    console.error('Error importing Excel data:', error);
    res.status(500).json({ error: 'Failed to import Excel data' });
  }
});

// Test import with sample data
router.post('/test-import', (req, res) => {
  try {
    const result = testImport();
    res.json({
      success: true,
      message: 'Test data imported successfully',
      ...result
    });
  } catch (error) {
    console.error('Error testing import:', error);
    res.status(500).json({ error: 'Failed to test import' });
  }
});

// Interactive Message Endpoints

// Process interactive message response (button clicks, list selections)
router.post('/interactive/process', async (req, res) => {
  try {
    const { interactiveData, phoneNumber } = req.body;
    
    if (!interactiveData || !phoneNumber) {
      return res.status(400).json({ error: 'interactiveData and phoneNumber are required' });
    }
    
    const result = messageLibraryService.processInteractiveResponse(interactiveData);
    
    if (result && result.nextMessage) {
      // Send the next message automatically
      const sendResult = await messageLibraryService.sendLibraryMessage(result.nextMessage, phoneNumber);
      
      res.json({
        success: true,
        trigger: result.trigger,
        nextMessage: result.nextMessage,
        sendResult
      });
    } else {
      res.json({
        success: false,
        message: 'No matching trigger found for interactive response',
        interactiveData
      });
    }
  } catch (error) {
    console.error('Error processing interactive response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get button information for a message
router.get('/messages/:messageId/buttons', (req, res) => {
  try {
    const buttons = messageLibraryService.getMessageButtons(req.params.messageId);
    res.json({
      messageId: req.params.messageId,
      buttons,
      count: buttons.length
    });
  } catch (error) {
    console.error('Error getting message buttons:', error);
    res.status(500).json({ error: 'Failed to get message buttons' });
  }
});

// Get list options for a message
router.get('/messages/:messageId/list-options', (req, res) => {
  try {
    const options = messageLibraryService.getMessageListOptions(req.params.messageId);
    res.json({
      messageId: req.params.messageId,
      options,
      count: options.length
    });
  } catch (error) {
    console.error('Error getting message list options:', error);
    res.status(500).json({ error: 'Failed to get message list options' });
  }
});

// Find button trigger
router.post('/triggers/button', (req, res) => {
  try {
    const { buttonId } = req.body;
    
    if (!buttonId) {
      return res.status(400).json({ error: 'buttonId is required' });
    }
    
    const trigger = messageLibraryService.findButtonTrigger(buttonId);
    
    if (trigger) {
      res.json({
        found: true,
        trigger,
        nextMessage: messageLibraryService.getMessageById(trigger.targetId)
      });
    } else {
      res.json({
        found: false,
        buttonId,
        message: 'No trigger found for this button'
      });
    }
  } catch (error) {
    console.error('Error finding button trigger:', error);
    res.status(500).json({ error: 'Failed to find button trigger' });
  }
});

// Find list trigger
router.post('/triggers/list', (req, res) => {
  try {
    const { listItemId } = req.body;
    
    if (!listItemId) {
      return res.status(400).json({ error: 'listItemId is required' });
    }
    
    const trigger = messageLibraryService.findListTrigger(listItemId);
    
    if (trigger) {
      res.json({
        found: true,
        trigger,
        nextMessage: messageLibraryService.getMessageById(trigger.targetId)
      });
    } else {
      res.json({
        found: false,
        listItemId,
        message: 'No trigger found for this list item'
      });
    }
  } catch (error) {
    console.error('Error finding list trigger:', error);
    res.status(500).json({ error: 'Failed to find list trigger' });
  }
});

// Send interactive welcome message
router.post('/send-welcome-interactive', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }
    
    const welcomeMessage = messageLibraryService.getMessageById('msg_welcome_interactive');
    if (!welcomeMessage) {
      return res.status(404).json({ error: 'Welcome interactive message not found' });
    }
    
    const result = await messageLibraryService.sendLibraryMessage(welcomeMessage, phoneNumber);
    res.json({
      success: true,
      message: 'Interactive welcome message sent',
      result
    });
  } catch (error) {
    console.error('Error sending interactive welcome message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all interactive messages
router.get('/messages/interactive', (req, res) => {
  try {
    const interactiveMessages = messageLibraryService.messages.filter(msg => 
      msg.type === 'interactive_button' || msg.type === 'interactive_list'
    );
    res.json({
      messages: interactiveMessages,
      count: interactiveMessages.length
    });
  } catch (error) {
    console.error('Error getting interactive messages:', error);
    res.status(500).json({ error: 'Failed to get interactive messages' });
  }
});

// Get all button-based triggers
router.get('/triggers/interactive', (req, res) => {
  try {
    const interactiveTriggers = messageLibraryService.triggers.filter(trigger => 
      trigger.triggerType === 'button_click' || trigger.triggerType === 'list_selection'
    );
    res.json({
      triggers: interactiveTriggers,
      count: interactiveTriggers.length
    });
  } catch (error) {
    console.error('Error getting interactive triggers:', error);
    res.status(500).json({ error: 'Failed to get interactive triggers' });
  }
});

module.exports = router;
