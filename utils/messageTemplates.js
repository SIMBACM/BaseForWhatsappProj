/**
 * Message Templates for WhatsApp Feedback Collection System
 * Centralized storage for all conversation messages
 */

const messageTemplates = {
  // Main conversation flow messages
  greeting: "👋 Hello! Thanks for contacting us. May I know your name?",
  
  nameReceived: (name) => `Nice to meet you, ${name}! Please share your feedback or review.`,
  
  feedbackReceived: "Got it! Finally, please send your profile picture 📸.",
  
  completed: (name) => `✅ Thank you, ${name}! Your feedback has been received successfully.`,
  
  // Error messages for wrong input types
  needText: "Please send a text message.",
  
  needImage: "Please send an image for your profile picture 📸",
  
  // System messages
  sessionExpired: "Your session has expired. Let's start fresh! 👋 Hello! Thanks for contacting us. May I know your name?",
  
  systemError: "Sorry, something went wrong. Please try again by sending 'hi'."
};

/**
 * Get a message template by key
 * @param {string} key - Template key
 * @param {object} data - Data for template interpolation
 * @returns {string} Formatted message
 */
function getTemplate(key, data = {}) {
  const template = messageTemplates[key];
  
  if (!template) {
    console.error(`Template not found: ${key}`);
    return messageTemplates.systemError;
  }
  
  // If template is a function, call it with data
  if (typeof template === 'function') {
    return template(data.name || data);
  }
  
  return template;
}

/**
 * Get all available template keys
 * @returns {string[]} Array of template keys
 */
function getAvailableTemplates() {
  return Object.keys(messageTemplates);
}

module.exports = {
  messageTemplates,
  getTemplate,
  getAvailableTemplates
};