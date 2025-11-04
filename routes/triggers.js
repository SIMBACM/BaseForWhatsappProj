const express = require('express');
const { 
  getAllTriggers, 
  createTrigger, 
  updateTrigger, 
  deleteTrigger,
  testTrigger 
} = require('../services/triggerService');

const router = express.Router();

// Get all triggers
router.get('/', (req, res) => {
  try {
    const triggers = getAllTriggers();
    res.json({
      success: true,
      data: triggers,
      count: triggers.length
    });
  } catch (error) {
    console.error('Error getting triggers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get triggers'
    });
  }
});

// Create new trigger
router.post('/', (req, res) => {
  try {
    const { keyword, flowId, message, isActive = true } = req.body;

    if (!keyword || !flowId) {
      return res.status(400).json({
        success: false,
        error: 'Keyword and flowId are required'
      });
    }

    const trigger = createTrigger({
      keyword,
      flowId,
      message: message || 'Please complete this form:',
      isActive
    });

    res.status(201).json({
      success: true,
      data: trigger
    });
  } catch (error) {
    console.error('Error creating trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trigger'
    });
  }
});

// Update trigger
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const trigger = updateTrigger(id, updates);

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    res.json({
      success: true,
      data: trigger
    });
  } catch (error) {
    console.error('Error updating trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update trigger'
    });
  }
});

// Delete trigger
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteTrigger(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    res.json({
      success: true,
      message: 'Trigger deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trigger'
    });
  }
});

// Test trigger with a message
router.post('/test', async (req, res) => {
  try {
    const { message, phoneNumber = '1234567890' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for testing'
      });
    }

    const result = await testTrigger(message, phoneNumber);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test trigger'
    });
  }
});

// Activate/deactivate trigger
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const trigger = updateTrigger(id, { isActive });

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    res.json({
      success: true,
      data: trigger,
      message: `Trigger ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle trigger'
    });
  }
});

module.exports = router;