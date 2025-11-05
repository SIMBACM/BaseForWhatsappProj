/**
 * Prisma Database Service for WhatsApp Feedback Collection
 * Handles database operations for feedback and conversation sessions
 */

const { PrismaClient } = require('../generated/prisma');

class PrismaService {
  constructor() {
    this.prisma = new PrismaClient();
    console.log('🗄️ Prisma database service initialized');
  }

  /**
   * Save completed feedback to database
   * @param {object} feedbackData - Feedback data to save
   * @returns {object} Saved feedback record
   */
  async saveFeedback(feedbackData) {
    try {
      const { 
        userPhone, 
        name, 
        feedback, 
        profileImageUrl, 
        whatsappImageId, 
        imageStoragePath, 
        sessionDuration 
      } = feedbackData;
      
      const savedFeedback = await this.prisma.feedback.create({
        data: {
          userPhone,
          name,
          feedback,
          profileImageUrl: profileImageUrl || null,
          whatsappImageId: whatsappImageId || null,
          imageStoragePath: imageStoragePath || null,
          sessionDuration: sessionDuration || null
        }
      });

      console.log(`💾 Feedback saved to database for ${userPhone}:`, savedFeedback.id);
      return savedFeedback;
    } catch (error) {
      console.error('❌ Error saving feedback to database:', error);
      throw error;
    }
  }

  /**
   * Get all feedback records
   * @param {object} options - Query options (limit, offset, etc.)
   * @returns {array} Array of feedback records
   */
  async getAllFeedback(options = {}) {
    try {
      const { limit = 50, offset = 0, orderBy = 'createdAt', order = 'desc' } = options;
      
      const feedbacks = await this.prisma.feedback.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          [orderBy]: order
        }
      });

      console.log(`📊 Retrieved ${feedbacks.length} feedback records from database`);
      return feedbacks;
    } catch (error) {
      console.error('❌ Error retrieving feedback from database:', error);
      throw error;
    }
  }

  /**
   * Get feedback by user phone number
   * @param {string} userPhone - User's phone number
   * @returns {array} Array of feedback records for the user
   */
  async getFeedbackByUser(userPhone) {
    try {
      const feedbacks = await this.prisma.feedback.findMany({
        where: {
          userPhone
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`📱 Retrieved ${feedbacks.length} feedback records for ${userPhone}`);
      return feedbacks;
    } catch (error) {
      console.error('❌ Error retrieving user feedback from database:', error);
      throw error;
    }
  }

  /**
   * Save conversation session to database
   * @param {object} sessionData - Session data to save
   * @returns {object} Saved session record
   */
  async saveConversationSession(sessionData) {
    try {
      const { 
        userPhone, 
        step, 
        name, 
        feedback, 
        whatsappImageId, 
        profileImageUrl, 
        isCompleted 
      } = sessionData;
      
      const savedSession = await this.prisma.conversationSession.upsert({
        where: {
          userPhone
        },
        update: {
          step,
          name: name || null,
          feedback: feedback || null,
          whatsappImageId: whatsappImageId || null,
          profileImageUrl: profileImageUrl || null,
          lastActivity: new Date(),
          isCompleted: isCompleted || false
        },
        create: {
          userPhone,
          step,
          name: name || null,
          feedback: feedback || null,
          whatsappImageId: whatsappImageId || null,
          profileImageUrl: profileImageUrl || null,
          isCompleted: isCompleted || false
        }
      });

      console.log(`💾 Session saved to database for ${userPhone} at step ${step}`);
      return savedSession;
    } catch (error) {
      console.error('❌ Error saving session to database:', error);
      throw error;
    }
  }

  /**
   * Get conversation session from database
   * @param {string} userPhone - User's phone number
   * @returns {object|null} Session record or null if not found
   */
  async getConversationSession(userPhone) {
    try {
      const session = await this.prisma.conversationSession.findUnique({
        where: {
          userPhone
        }
      });

      if (session) {
        console.log(`📱 Retrieved session for ${userPhone} at step ${session.step}`);
      }
      
      return session;
    } catch (error) {
      console.error('❌ Error retrieving session from database:', error);
      throw error;
    }
  }

  /**
   * Delete conversation session from database
   * @param {string} userPhone - User's phone number
   * @returns {boolean} True if deleted successfully
   */
  async deleteConversationSession(userPhone) {
    try {
      await this.prisma.conversationSession.delete({
        where: {
          userPhone
        }
      });

      console.log(`🗑️ Session deleted from database for ${userPhone}`);
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found - that's okay
        console.log(`📝 No session found to delete for ${userPhone}`);
        return true;
      }
      console.error('❌ Error deleting session from database:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions from database
   * @param {number} hoursOld - Sessions older than this many hours will be deleted
   * @returns {number} Number of sessions deleted
   */
  async cleanupExpiredSessions(hoursOld = 12) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

      const result = await this.prisma.conversationSession.deleteMany({
        where: {
          lastActivity: {
            lt: cutoffTime
          },
          isCompleted: false
        }
      });

      console.log(`🧹 Cleaned up ${result.count} expired sessions from database`);
      return result.count;
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics
   * @returns {object} Statistics about feedback collection
   */
  async getFeedbackStats() {
    try {
      const totalFeedback = await this.prisma.feedback.count();
      const todayFeedback = await this.prisma.feedback.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      const activeSessions = await this.prisma.conversationSession.count({
        where: {
          isCompleted: false
        }
      });

      const stats = {
        totalFeedback,
        todayFeedback,
        activeSessions,
        timestamp: new Date().toISOString()
      };

      console.log('📊 Feedback statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting feedback statistics:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
    console.log('🔌 Prisma database connection closed');
  }
}

// Create singleton instance
const prismaService = new PrismaService();

module.exports = prismaService;