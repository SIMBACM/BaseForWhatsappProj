/**
 * Conversation State Manager for WhatsApp Feedback Collection
 * Manages user sessions and conversation flow state
 */

class ConversationStateManager {
  constructor() {
    this.sessions = new Map(); // userPhone -> sessionData
    this.sessionTimeout = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    this.cleanupInterval = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Start automatic cleanup timer
    this.startCleanupTimer();
    
    console.log('🔄 ConversationStateManager initialized with 12-hour session timeout');
  }

  /**
   * Create a new conversation session for a user
   * @param {string} userPhone - User's phone number
   * @returns {object} New session data
   */
  createSession(userPhone) {
    const session = {
      step: 1,
      name: '',
      feedback: '',
      profileImageUrl: '',
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(userPhone, session);
    console.log(`📱 Created new session for ${userPhone} at step 1`);
    
    return session;
  }

  /**
   * Get existing session or create new one
   * @param {string} userPhone - User's phone number
   * @returns {object} Session data
   */
  getSession(userPhone) {
    let session = this.sessions.get(userPhone);
    
    // Check if session exists and is not expired
    if (session && this.isSessionExpired(session)) {
      console.log(`⏰ Session expired for ${userPhone}, creating new session`);
      this.sessions.delete(userPhone);
      session = null;
    }
    
    // Create new session if none exists or expired
    if (!session) {
      session = this.createSession(userPhone);
    } else {
      // Update last activity
      session.lastActivity = new Date();
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
  updateSession(userPhone, updates) {
    const session = this.sessions.get(userPhone);
    
    if (!session) {
      console.error(`❌ Attempted to update non-existent session for ${userPhone}`);
      return this.createSession(userPhone);
    }
    
    // Update session data
    Object.assign(session, updates, { lastActivity: new Date() });
    
    console.log(`📝 Updated session for ${userPhone}:`, updates);
    
    return session;
  }

  /**
   * Advance session to next step
   * @param {string} userPhone - User's phone number
   * @returns {object} Updated session data
   */
  advanceStep(userPhone) {
    const session = this.getSession(userPhone);
    const nextStep = Math.min(session.step + 1, 4);
    
    return this.updateSession(userPhone, { step: nextStep });
  }

  /**
   * Complete and remove session
   * @param {string} userPhone - User's phone number
   * @returns {object} Final session data before removal
   */
  completeSession(userPhone) {
    const session = this.sessions.get(userPhone);
    
    if (!session) {
      console.error(`❌ Attempted to complete non-existent session for ${userPhone}`);
      return null;
    }
    
    // Log completion data
    this.logCompletedFeedback(userPhone, session);
    
    // Remove session from memory
    this.sessions.delete(userPhone);
    console.log(`✅ Completed and removed session for ${userPhone}`);
    
    return session;
  }

  /**
   * Check if session has expired
   * @param {object} session - Session data
   * @returns {boolean} True if expired
   */
  isSessionExpired(session) {
    const now = new Date();
    const timeDiff = now - session.lastActivity;
    return timeDiff > this.sessionTimeout;
  }

  /**
   * Get session statistics
   * @returns {object} Session statistics
   */
  getSessionStats() {
    const totalSessions = this.sessions.size;
    const sessionsByStep = {};
    
    for (const session of this.sessions.values()) {
      const step = session.step;
      sessionsByStep[step] = (sessionsByStep[step] || 0) + 1;
    }
    
    return {
      totalActiveSessions: totalSessions,
      sessionsByStep,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [userPhone, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(userPhone);
        cleanedCount++;
        console.log(`🧹 Cleaned up expired session for ${userPhone}`);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleanup completed: Removed ${cleanedCount} expired sessions`);
    }
    
    return cleanedCount;
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
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
  resetSession(userPhone) {
    console.log(`🔄 Resetting session for ${userPhone} to step 1`);
    return this.updateSession(userPhone, {
      step: 1,
      name: '',
      feedback: '',
      profileImageUrl: ''
    });
  }
}

// Create singleton instance
const conversationManager = new ConversationStateManager();

module.exports = conversationManager;