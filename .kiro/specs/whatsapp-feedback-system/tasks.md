# Implementation Plan - WhatsApp Feedback Collection System

Convert the existing WhatsApp Business API backend from hospital/contest automation to a streamlined feedback collection system with 4-step conversation flow.

- [x] 1. Create core conversation management infrastructure


  - Create conversation state manager for tracking user sessions
  - Implement message templates utility for standardized responses
  - Set up session cleanup timer for 12-hour timeout management
  - _Requirements: 5.1, 5.2, 5.3, 5.4_




- [ ] 2. Implement feedback conversation flow logic
  - [ ] 2.1 Create conversation manager service
    - Implement ConversationStateManager class with session CRUD operations
    - Add session creation, retrieval, update, and completion methods

    - Implement automatic session cleanup for expired sessions
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.2 Create message templates utility
    - Define all conversation step messages (greeting, name received, feedback received, completed)


    - Add error message templates for wrong input types
    - Implement template interpolation for personalized messages
    - _Requirements: 1.1, 2.2, 3.2, 4.2, 8.2, 8.3_




  - [ ] 2.3 Implement step-based message processing
    - Create message type detection (text vs image)
    - Implement step progression logic (1→2→3→4)
    - Add input validation for each conversation step

    - _Requirements: 2.1, 2.3, 3.1, 3.3, 4.1, 4.3_

- [ ] 3. Refactor webhook service for feedback collection
  - [ ] 3.1 Replace existing webhook logic
    - Remove all hospital appointment booking functionality

    - Remove contest registration and draw management logic
    - Remove interactive button and list message handling
    - _Requirements: 7.1, 7.2, 7.3_




  - [ ] 3.2 Implement new feedback webhook handler
    - Process "hi" trigger to start feedback flow
    - Route messages to appropriate conversation step handler
    - Integrate with conversation state manager
    - _Requirements: 1.1, 1.2, 1.3, 1.4_


  - [ ] 3.3 Add conversation step processors
    - Implement name collection handler (step 1→2)
    - Implement feedback collection handler (step 2→3)

    - Implement image collection handler (step 3→4)

    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2_

- [ ] 4. Update WhatsApp service for simplified messaging
  - [ ] 4.1 Simplify WhatsApp service methods
    - Keep sendTextMessage method for basic text responses

    - Remove sendFlowMessage and interactive message methods
    - Remove template message functionality not needed for feedback
    - _Requirements: 7.4_


  - [x] 4.2 Implement feedback-specific message sending

    - Add method to send personalized messages using templates
    - Ensure proper error handling for WhatsApp API failures
    - Maintain existing webhook verification and security
    - _Requirements: 1.1, 2.2, 3.2, 4.2_


- [ ] 5. Implement data logging and session completion
  - [ ] 5.1 Add console logging for completed feedback
    - Log collected data in structured JSON format
    - Include timestamp, user phone, name, feedback, and image URL
    - Calculate and log session duration
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 5.2 Implement session completion workflow
    - Mark session as completed after image upload
    - Trigger data logging when feedback flow finishes



    - Clean up completed sessions from memory
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 6. Add error handling and input validation
  - [ ] 6.1 Implement input type validation
    - Validate text input for name and feedback steps

    - Validate image input for profile picture step
    - Send appropriate error messages for wrong input types
    - _Requirements: 8.1, 8.2, 8.3, 8.4_




  - [x] 6.2 Add conversation error recovery

    - Handle unexpected message types gracefully
    - Maintain current step when invalid input received
    - Provide clear guidance messages to users

    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. Clean up legacy code and routes
  - [ ] 7.1 Remove unused route files
    - Delete routes/messageLibrary.js

    - Delete routes/triggers.js
    - Delete routes/draws.js
    - Delete routes/admins.js
    - _Requirements: 7.1, 7.2, 7.3_





  - [ ] 7.2 Remove unused service files
    - Delete services/messageLibraryService.js
    - Delete services/triggerService.js
    - Remove contest-related logic from webhookService.js

    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 7.3 Update server.js configuration
    - Remove unused route registrations
    - Keep core webhook and WhatsApp routes

    - Update API endpoint documentation
    - _Requirements: 7.4, 7.5_

- [ ] 8. Create comprehensive testing suite
  - [ ] 8.1 Create unit tests for conversation manager
    - Test session creation, retrieval, and updates
    - Test session timeout and cleanup functionality
    - Test step progression and validation logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 8.2 Create integration tests for feedback flow
    - Test complete conversation flow from start to finish
    - Test error handling for wrong input types
    - Test session timeout behavior
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

  - [ ] 8.3 Create manual testing scenarios
    - Document test cases for happy path and error scenarios
    - Create test scripts for webhook simulation
    - Validate console logging output format
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Final integration and deployment preparation
  - [ ] 9.1 Test complete system integration
    - Verify WhatsApp webhook integration works end-to-end
    - Test with real WhatsApp messages in development
    - Validate all conversation paths and error handling
    - _Requirements: All requirements_

  - [ ] 9.2 Prepare for production deployment
    - Update environment variables for feedback system
    - Remove any hospital/contest related configurations
    - Ensure proper logging and monitoring setup
    - _Requirements: 7.5_

  - [ ] 9.3 Create deployment documentation
    - Document new API endpoints and functionality
    - Create troubleshooting guide for common issues
    - Update README with feedback system information
    - _Requirements: 7.5_