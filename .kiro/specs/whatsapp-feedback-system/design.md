# WhatsApp Feedback Collection System - Design

## Overview

The WhatsApp Feedback Collection System transforms the existing backend into a streamlined conversation-based feedback collector. The system maintains the robust WhatsApp Business API integration while replacing complex hospital/contest workflows with a simple 4-step feedback collection process.

## Architecture

### High-Level Architecture

```
WhatsApp Business API
        ↓
   Webhook Handler
        ↓
  Conversation Manager
        ↓
   Message Processor
        ↓
  Response Generator
        ↓
WhatsApp Business API
```

### Core Components

1. **Webhook Handler** - Receives and validates WhatsApp webhooks
2. **Conversation Manager** - Tracks user sessions and conversation state
3. **Message Processor** - Processes user inputs based on current step
4. **Response Generator** - Creates appropriate responses for each step
5. **Session Cleanup** - Manages session timeouts and memory cleanup

## Components and Interfaces

### 1. Conversation State Manager

```javascript
class ConversationStateManager {
  constructor() {
    this.sessions = new Map(); // userPhone -> sessionData
    this.startCleanupTimer();
  }

  createSession(userPhone) {
    return {
      step: 1,
      name: '',
      feedback: '',
      profileImageUrl: '',
      createdAt: new Date(),
      lastActivity: new Date()
    };
  }

  getSession(userPhone) { /* ... */ }
  updateSession(userPhone, updates) { /* ... */ }
  completeSession(userPhone) { /* ... */ }
  cleanupExpiredSessions() { /* ... */ }
}
```

### 2. Message Templates

```javascript
const messageTemplates = {
  greeting: "👋 Hello! Thanks for contacting us. May I know your name?",
  nameReceived: (name) => `Nice to meet you, ${name}! Please share your feedback or review.`,
  feedbackReceived: "Got it! Finally, please send your profile picture 📸.",
  completed: (name) => `✅ Thank you, ${name}! Your feedback has been received successfully.`,
  
  // Error messages
  needText: "Please send a text message.",
  needImage: "Please send an image for your profile picture 📸"
};
```

### 3. Webhook Service Interface

```javascript
class WebhookService {
  async processWebhookPayload(payload) {
    // Extract message data
    // Route to conversation handler
    // Send appropriate response
  }

  async handleIncomingMessage(message) {
    const userPhone = message.from;
    const session = conversationManager.getSession(userPhone);
    
    // Process based on current step
    // Generate response
    // Update session state
  }
}
```

### 4. WhatsApp Service Interface

```javascript
class WhatsAppService {
  async sendTextMessage(phoneNumber, text) { /* ... */ }
  async sendTemplateMessage(phoneNumber, template, data) { /* ... */ }
  // Remove: sendFlowMessage, sendInteractiveMessage
}
```

## Data Models

### Session Data Structure

```javascript
const sessionSchema = {
  step: Number,           // 1-4: current conversation step
  name: String,           // User's provided name
  feedback: String,       // User's feedback text
  profileImageUrl: String, // WhatsApp image URL
  createdAt: Date,        // Session creation time
  lastActivity: Date      // Last user interaction
};
```

### Conversation Steps

```javascript
const conversationSteps = {
  1: 'WAITING_FOR_NAME',
  2: 'WAITING_FOR_FEEDBACK', 
  3: 'WAITING_FOR_IMAGE',
  4: 'COMPLETED'
};
```

### Console Log Format

```javascript
const feedbackLogFormat = {
  timestamp: "2024-01-15T10:30:00.000Z",
  userPhone: "+1234567890",
  name: "John Doe",
  feedback: "Great service, very satisfied!",
  profileImageUrl: "https://mmg.whatsapp.net/...",
  sessionDuration: "5 minutes"
};
```

## Error Handling

### Input Validation Strategy

1. **Step 1 (Name)**: Accept any text, reject images/other media
2. **Step 2 (Feedback)**: Accept any text, reject images/other media  
3. **Step 3 (Image)**: Accept any image format, reject text/other media
4. **Invalid Step**: Reset to step 1 with greeting

### Error Response Flow

```javascript
const errorHandling = {
  wrongInputType: {
    textExpected: "Please send a text message.",
    imageExpected: "Please send an image for your profile picture 📸"
  },
  sessionExpired: "Your session has expired. Let's start fresh!",
  systemError: "Sorry, something went wrong. Please try again."
};
```

### Timeout Handling

- **Session Timeout**: 12 hours of inactivity
- **Cleanup Frequency**: Every 1 hour
- **Expired Session Action**: Remove from memory, start fresh on next message

## Testing Strategy

### Unit Tests

1. **Conversation State Manager**
   - Session creation and retrieval
   - Step progression logic
   - Session cleanup functionality

2. **Message Processing**
   - Correct step identification
   - Input type validation
   - Response generation

3. **WhatsApp Integration**
   - Message sending functionality
   - Webhook payload processing
   - Error handling

### Integration Tests

1. **Complete Feedback Flow**
   - End-to-end conversation simulation
   - Data collection verification
   - Console logging validation

2. **Error Scenarios**
   - Wrong input type handling
   - Session timeout behavior
   - System error recovery

### Manual Testing Scenarios

```javascript
const testScenarios = [
  {
    name: "Happy Path",
    steps: [
      { send: "hi", expect: "Hello! Thanks for contacting us..." },
      { send: "John Doe", expect: "Nice to meet you, John Doe!..." },
      { send: "Great service!", expect: "Got it! Finally, please send..." },
      { send: "[image]", expect: "Thank you, John Doe! Your feedback..." }
    ]
  },
  {
    name: "Wrong Input Types",
    steps: [
      { send: "hi", expect: "Hello! Thanks for contacting us..." },
      { send: "[image]", expect: "Please send a text message." },
      { send: "John", expect: "Nice to meet you, John!..." }
    ]
  }
];
```

## Implementation Plan

### Phase 1: Core Refactoring
1. Remove hospital/contest logic from webhook service
2. Implement conversation state manager
3. Create message templates utility
4. Update webhook handler for feedback flow

### Phase 2: Conversation Logic
1. Implement step-based message processing
2. Add input type validation
3. Create response generation logic
4. Implement session management

### Phase 3: Session Management
1. Add session timeout functionality
2. Implement cleanup timer
3. Add session persistence (in-memory)
4. Handle session expiry scenarios

### Phase 4: Testing & Validation
1. Create comprehensive test suite
2. Test all conversation paths
3. Validate console logging
4. Performance testing with multiple users

## File Modifications Required

### Files to Modify
- `services/webhookService.js` - Replace with feedback conversation logic
- `services/whatsappService.js` - Simplify to basic text messaging
- `routes/webhook.js` - Update for new conversation flow
- `server.js` - Remove unused routes

### Files to Remove/Simplify
- `services/messageLibraryService.js` - Replace with simple templates
- `services/triggerService.js` - Remove (replaced by conversation steps)
- `routes/messageLibrary.js` - Remove
- `routes/triggers.js` - Remove
- `routes/draws.js` - Remove
- `routes/admins.js` - Remove

### New Files to Create
- `utils/messageTemplates.js` - Centralized message templates
- `services/conversationManager.js` - Session state management

## Performance Considerations

### Memory Management
- Use Map for O(1) session lookup
- Implement automatic cleanup to prevent memory leaks
- Limit maximum concurrent sessions (optional)

### Response Time
- Target < 200ms response time for webhook processing
- Minimize external API calls during conversation
- Cache message templates in memory

### Scalability
- Stateless design allows horizontal scaling
- Session data can be moved to Redis for multi-instance deployment
- WhatsApp API rate limiting considerations

## Security Considerations

### Data Protection
- No sensitive data stored (names and feedback only)
- Session data cleared after completion
- Image URLs are temporary WhatsApp links

### Input Sanitization
- Validate message types before processing
- Prevent injection attacks in console logging
- Rate limiting for webhook endpoints

### Access Control
- Maintain existing webhook verification
- Secure environment variable handling
- CORS configuration for development

## Migration Strategy

### Backward Compatibility
- Maintain existing WhatsApp API integration
- Preserve webhook verification logic
- Keep server structure and deployment configuration

### Data Migration
- No database migration required (console logging only)
- Remove existing in-memory trigger data
- Clear any cached message library data

### Deployment Strategy
1. Deploy to staging environment first
2. Test with limited phone numbers
3. Gradual rollout to production
4. Monitor console logs for data collection

This design provides a clean, maintainable solution that transforms the existing complex system into a focused feedback collection tool while preserving the robust WhatsApp integration infrastructure.