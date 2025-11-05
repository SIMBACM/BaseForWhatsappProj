# WhatsApp Feedback Collection System - Requirements

## Introduction

Transform the existing WhatsApp Business API backend from a hospital/contest automation system into a streamlined feedback collection system. The system will guide users through a 4-step conversation flow to collect their name, feedback, and profile picture.

## Glossary

- **WhatsApp_Backend**: The Node.js Express server handling WhatsApp Business API webhooks
- **Feedback_Flow**: The 4-step conversation sequence for collecting user feedback
- **Conversation_State**: In-memory storage tracking each user's progress through the feedback flow
- **User_Session**: Individual user's conversation progress identified by phone number
- **Webhook_Handler**: Service that processes incoming WhatsApp messages
- **Message_Sender**: Service that sends replies via WhatsApp Business API

## Requirements

### Requirement 1: Feedback Flow Initiation

**User Story:** As a user, I want to start the feedback collection process by sending "hi" to the WhatsApp number, so that I can provide my feedback easily.

#### Acceptance Criteria

1. WHEN a user sends "hi" message, THE WhatsApp_Backend SHALL respond with "👋 Hello! Thanks for contacting us. May I know your name?"
2. WHEN a user sends "hi" message, THE WhatsApp_Backend SHALL initialize a new User_Session with step 1
3. WHEN a user sends "hi" message, THE WhatsApp_Backend SHALL store the user's phone number as the session identifier
4. IF a user already has an active User_Session, THEN THE WhatsApp_Backend SHALL reset the session and start from step 1

### Requirement 2: Name Collection

**User Story:** As a user, I want to provide my name after the initial greeting, so that the system can personalize the conversation.

#### Acceptance Criteria

1. WHEN a user is in step 1 and sends any text message, THE WhatsApp_Backend SHALL store the message as the user's name
2. WHEN the name is received, THE WhatsApp_Backend SHALL respond with "Nice to meet you, [name]! Please share your feedback or review."
3. WHEN the name is stored, THE WhatsApp_Backend SHALL advance the User_Session to step 2
4. THE WhatsApp_Backend SHALL accept any text input as a valid name without validation

### Requirement 3: Feedback Collection

**User Story:** As a user, I want to share my feedback or review, so that the business can understand my experience.

#### Acceptance Criteria

1. WHEN a user is in step 2 and sends any text message, THE WhatsApp_Backend SHALL store the message as feedback
2. WHEN feedback is received, THE WhatsApp_Backend SHALL respond with "Got it! Finally, please send your profile picture 📸."
3. WHEN feedback is stored, THE WhatsApp_Backend SHALL advance the User_Session to step 3
4. THE WhatsApp_Backend SHALL accept any text input as valid feedback without length restrictions

### Requirement 4: Profile Picture Collection

**User Story:** As a user, I want to send my profile picture to complete the feedback process, so that my feedback is associated with my image.

#### Acceptance Criteria

1. WHEN a user is in step 3 and sends an image message, THE WhatsApp_Backend SHALL store the image URL
2. WHEN an image is received, THE WhatsApp_Backend SHALL respond with "✅ Thank you, [name]! Your feedback has been received successfully."
3. WHEN the image is processed, THE WhatsApp_Backend SHALL complete the User_Session
4. THE WhatsApp_Backend SHALL accept all image formats without validation
5. WHEN the flow is complete, THE WhatsApp_Backend SHALL log all collected data to console

### Requirement 5: Session Management

**User Story:** As a system administrator, I want user sessions to expire after 12 hours of inactivity, so that memory usage is controlled and stale sessions are cleaned up.

#### Acceptance Criteria

1. WHEN a User_Session is created, THE WhatsApp_Backend SHALL record the creation timestamp
2. WHEN 12 hours pass without user interaction, THE WhatsApp_Backend SHALL remove the User_Session from memory
3. WHEN a user sends a message after session expiry, THE WhatsApp_Backend SHALL start a new feedback flow from step 1
4. THE WhatsApp_Backend SHALL check for expired sessions every hour and clean them up

### Requirement 6: Data Logging

**User Story:** As a developer, I want all collected feedback data to be logged to the console, so that I can verify the system is working before database integration.

#### Acceptance Criteria

1. WHEN a feedback flow is completed, THE WhatsApp_Backend SHALL log the collected data in JSON format
2. THE logged data SHALL include name, feedback, and profileImageUrl fields
3. THE WhatsApp_Backend SHALL log the completion timestamp
4. THE console output SHALL be formatted for easy reading and debugging

### Requirement 7: Legacy System Replacement

**User Story:** As a system maintainer, I want all existing hospital and contest functionality removed, so that the system focuses solely on feedback collection.

#### Acceptance Criteria

1. THE WhatsApp_Backend SHALL remove all hospital appointment booking logic
2. THE WhatsApp_Backend SHALL remove all contest and draw management functionality
3. THE WhatsApp_Backend SHALL remove all interactive button and list message handling
4. THE WhatsApp_Backend SHALL maintain only the core WhatsApp API integration and webhook handling
5. THE WhatsApp_Backend SHALL preserve the existing server structure and routing framework

### Requirement 8: Error Handling

**User Story:** As a user, I want the system to handle unexpected inputs gracefully, so that I can complete the feedback process even if I make mistakes.

#### Acceptance Criteria

1. WHEN a user sends an unsupported message type in any step, THE WhatsApp_Backend SHALL respond with appropriate guidance
2. WHEN a user sends text instead of image in step 3, THE WhatsApp_Backend SHALL respond "Please send an image for your profile picture 📸"
3. WHEN a user sends image in steps 1 or 2, THE WhatsApp_Backend SHALL respond "Please send a text message"
4. THE WhatsApp_Backend SHALL maintain the current step and not advance until correct input is received