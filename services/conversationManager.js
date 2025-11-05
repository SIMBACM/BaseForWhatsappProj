/**
 * Conversation State Manager for WhatsApp Feedback Collection
 * Manages user sessions and conversation flow state using Prisma database
 */

const prismaService = require('./prismaService');

class ConversationStateManager {
  constructor() {
    this.sessionTimeout = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    this.cleanupInterval = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Start automatic cleanup timer
    this.startCleanupTimer();
    
    console.log('🔄 ConversationStateManager initialized with Prisma database and 12-hour session timeout');
  }

  /**
   * Create a new conversation session for a user
   * @param {string} userPhone - User's phone number
   * @returns {object} New session data
   */
  async createSession(userPhone) {
    const sessionData = {
      userPhone,
      step: 1,
      name: null,
      feedback: null,
      profileImageUrl: null,
      isCompleted: false
    };
    
    const session = await prismaService.saveConversationSession(sessionData);
    console.log(`📱 Created new session for ${userPhone} at step 1`);
    
    return session;
  }

  /**
   * Get existing session or create new one
   * @param {string} userPhone - User's phone number
   * @returns {object} Session data
   */
  async getSession(userPhone) {
    let session = await prismaService.getConversationSession(userPhone);
    
    // Check if session exists and is not expired
    if (session && this.isSessionExpired(session)) {
      console.log(`⏰ Session expired for ${userPhone}, creating new session`);
      await prismaService.deleteConversationSession(userPhone);
      session = null;
    }
    
    // Create new session if none exists or expired
    if (!session) {
      session = await this.createSession(userPhone);
    } else {
      // Update last activity
      await prismaService.saveConversationSession({
        ...session,
        lastActivity: new Date()
      });
      console.log(`📱 Retrieved existing session for ${userPhone} at step ${session.step}`);
    }
    
    return session;
  }

  /**
   * Update session data
   * @param {string} userPhone - User's phone number
   * @param {object} updates - Data to update
   * @returns {object} Updated session data
   */
  async updateSession(userPhone, updates) {
    let session = await prismaService.getConversationSession(userPhone);
    
    if (!session) {
      console.error(`❌ Attempted to update non-existent session for ${userPhone}`);
      return await this.createSession(userPhone);
    }
    
    // Update session data
    const updatedSessionData = {
      ...session,
      ...updates,
      lastActivity: new Date()
    };
    
    session = await prismaService.saveConversationSession(updatedSessionData);
    console.log(`📝 Updated session for ${userPhone}:`, updates);
    
    return session;
  }

  /**
   * Advance session to next step
   * @param {string} userPhone - User's phone number
   * @returns {object} Updated session data
   */
  async advanceStep(userPhone) {
    const session = await this.getSession(userPhone);
    const nextStep = Math.min(session.step + 1, 4);
    
    return await this.updateSession(userPhone, { step: nextStep });
  }

  /**
   * Complete and remove session
   * @param {string} userPhone - User's phone number
   * @returns {object} Final session data before removal
   */
  async completeSession(userPhone) {
    const session = await prismaService.getConversationSession(userPhone);
    
    if (!session) {
      console.error(`❌ Attempted to complete non-existent session for ${userPhone}`);
      return null;
    }
    
    // Calculate session duration
    const sessionDuration = Math.round((new Date() - new Date(session.createdAt)) / 1000);
    
    // Save feedback to database
    const feedbackData = {
      userPhone: session.userPhone,
      name: session.name,
      feedback: session.feedback,
      profileImageUrl: session.profileImageUrl,
      sessionDuration
    };
    
    await prismaService.saveFeedback(feedbackData);
    
    // Log completion data to console (for backward compatibility)
    this.logCompletedFeedback(userPhone, { ...session, sessionDuration });
    
    // Mark session as completed and remove from active sessions
    await prismaService.saveConversationSession({
      ...session,
      isCompleted: true
    });
    await prismaService.deleteConversationSession(userPhone);
    
    console.log(`✅ Completed and saved feedback for ${userPhone}`);
    
    return session;
  }

  /**
   * Check if session has expired
   * @param {object} session - Session data
   * @returns {boolean} True if expired
   */
  isSessionExpired(session) {
    const now = new Date();
    const timeDiff = now - new Date(session.lastActivity);
    return timeDiff > this.sessionTimeout;
  }

  /**
   * Get session statistics
   * @returns {object} Session statistics
   */
  async getSessionStats() {
    return await prismaService.getFeedbackStats();
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    const cleanedCount = await prismaService.cleanupExpiredSessions(12);
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleanup completed: Removed ${cleanedCount} expired sessions from database`);
    }
    
    return cleanedCount;
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanupTimer() {
    setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, this.cleanupInterval);
    
    console.log('⏰ Started automatic session cleanup timer (runs every hour)');
  }

  /**
   * Log completed feedback data to console
   * @param {string} userPhone - User's phone number
   * @param {object} session - Session data
   */
  logCompletedFeedback(userPhone, session) {
    const sessionDuration = new Date() - session.createdAt;
    const durationMinutes = Math.round(sessionDuration / (1000 * 60));
    
    const feedbackData = {
      timestamp: new Date().toISOString(),
      userPhone: userPhone,
      name: session.name,
      feedback: session.feedback,
      profileImageUrl: session.profileImageUrl,
      sessionDuration: `${durationMinutes} minutes`,
      completedAt: new Date().toISOString()
    };
    
    console.log('\n🎉 FEEDBACK COLLECTION COMPLETED:');
    console.log('=====================================');
    console.log(JSON.stringify(feedbackData, null, 2));
    console.log('=====================================\n');
  }

  /**
   * Reset session to step 1 (for error recovery)
   * @param {string} userPhone - User's phone number
   * @returns {object} Reset session data
   */
  async resetSession(userPhone) {
    console.log(`🔄 Resetting session for ${userPhone} to step 1`);
    return await this.updateSession(userPhone, {
      step: 1,
      name: null,
      feedback: null,
      profileImageUrl: null
    });
  }
}

// Create singleton instance
const conversationManager = new ConversationStateManager();

module.exports = conversationManager;