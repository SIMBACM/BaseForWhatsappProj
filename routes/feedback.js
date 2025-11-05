/**
 * Feedback API Routes
 * Provides endpoints to view and manage collected feedback data
 */

const express = require('express');
const prismaService = require('../services/prismaService');
const conversationManager = require('../services/conversationManager');

const router = express.Router();

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, orderBy = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
      order
    };
    
    const feedbacks = await prismaService.getAllFeedback(options);
    
    res.json({
      success: true,
      data: feedbacks,
      count: feedbacks.length,
      pagination: {
        limit: options.limit,
        offset: options.offset
      }
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

// Get feedback by user phone number
router.get('/user/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const feedbacks = await prismaService.getFeedbackByUser(phoneNumber);
    
    res.json({
      success: true,
      data: feedbacks,
      count: feedbacks.length,
      userPhone: phoneNumber
    });
  } catch (error) {
    console.error('Error getting user feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user feedback'
    });
  }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await conversationManager.getSessionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback statistics'
    });
  }
});

// Get specific feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await prismaService.prisma.feedback.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error getting feedback by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

// Export feedback data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const feedbacks = await prismaService.getAllFeedback({ limit: 10000 });
    
    // Create CSV content
    const csvHeader = 'ID,User Phone,Name,Feedback,Profile Image URL,Session Duration (seconds),Created At\n';
    const csvRows = feedbacks.map(feedback => {
      const escapedFeedback = `"${feedback.feedback.replace(/"/g, '""')}"`;
      const escapedName = `"${feedback.name.replace(/"/g, '""')}"`;
      
      return [
        feedback.id,
        feedback.userPhone,
        escapedName,
        escapedFeedback,
        feedback.profileImageUrl || '',
        feedback.sessionDuration || '',
        feedback.createdAt.toISOString()
      ].join(',');
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="feedback-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting feedback CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export feedback data'
    });
  }
});

// Delete feedback by ID (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prismaService.prisma.feedback.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }
    
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
});

// Clean up expired sessions manually
router.post('/cleanup-sessions', async (req, res) => {
  try {
    const cleanedCount = await conversationManager.cleanupExpiredSessions();
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired sessions`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sessions'
    });
  }
});

// Get storage statistics
router.get('/storage/stats', async (req, res) => {
  try {
    const supabaseStorageService = require('../services/supabaseStorageService');
    const stats = await supabaseStorageService.getStorageStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage statistics'
    });
  }
});

// Test storage connectivity
router.get('/storage/test', async (req, res) => {
  try {
    const supabaseStorageService = require('../services/supabaseStorageService');
    const testResult = await supabaseStorageService.testStorage();
    
    res.json({
      success: testResult.success,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing storage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test storage'
    });
  }
});

// Reprocess image for a specific feedback (admin endpoint)
router.post('/:id/reprocess-image', async (req, res) => {
  try {
    const { id } = req.params;
    const supabaseStorageService = require('../services/supabaseStorageService');
    
    // Get feedback record
    const feedback = await prismaService.prisma.feedback.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }
    
    if (!feedback.whatsappImageId) {
      return res.status(400).json({
        success: false,
        error: 'No WhatsApp image ID found for this feedback'
      });
    }
    
    // Reprocess the image
    const uploadResult = await supabaseStorageService.uploadWhatsAppImage(
      feedback.whatsappImageId,
      feedback.userPhone,
      feedback.id
    );
    
    if (uploadResult.success) {
      // Update feedback record
      await prismaService.prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          profileImageUrl: uploadResult.publicUrl,
          imageStoragePath: uploadResult.filePath
        }
      });
      
      res.json({
        success: true,
        message: 'Image reprocessed successfully',
        imageUrl: uploadResult.publicUrl
      });
    } else {
      res.status(500).json({
        success: false,
        error: uploadResult.error
      });
    }
    
  } catch (error) {
    console.error('Error reprocessing image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reprocess image'
    });
  }
});

module.exports = router;