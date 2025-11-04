# How to Trigger Interactive Messages

## 🚀 Quick Start Guide

### 1. Start the Server
```bash
cd d:\hospital\whatsapp_backend
npm start
```

### 2. Trigger Interactive Messages

#### Method 1: Send Welcome Message via API
```bash
curl -X POST http://localhost:3000/api/message-library/send-welcome-interactive \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

#### Method 2: Simulate Text Message (triggers interactive welcome)
```bash
curl -X POST http://localhost:3000/api/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{"message": "hi", "phoneNumber": "+1234567890"}'
```

#### Method 3: Test Button Clicks
```bash
# Test booking appointment button
curl -X POST http://localhost:3000/api/webhook/test-button \
  -H "Content-Type: application/json" \
  -d '{"buttonId": "btn_book_appointment", "phoneNumber": "+1234567890"}'

# Test lab tests button
curl -X POST http://localhost:3000/api/webhook/test-button \
  -H "Content-Type: application/json" \
  -d '{"buttonId": "btn_lab_tests", "phoneNumber": "+1234567890"}'

# Test emergency button
curl -X POST http://localhost:3000/api/webhook/test-button \
  -H "Content-Type: application/json" \
  -d '{"buttonId": "btn_emergency", "phoneNumber": "+1234567890"}'
```

#### Method 4: Test List Selections
```bash
# Test doctor selection
curl -X POST http://localhost:3000/api/webhook/test-list \
  -H "Content-Type: application/json" \
  -d '{"listItemId": "dr_sharma", "phoneNumber": "+1234567890"}'

# Test lab test selection
curl -X POST http://localhost:3000/api/webhook/test-list \
  -H "Content-Type: application/json" \
  -d '{"listItemId": "test_blood_sugar", "phoneNumber": "+1234567890"}'
```

## 🎯 Complete User Flow Test

Run the automated test suite:
```bash
node test_interactive_messages.js
```

Or test specific scenarios:
```bash
# Test complete appointment booking flow
node test_interactive_messages.js --flow

# Test specific scenarios
node test_interactive_messages.js --scenarios
```

## 📱 Keywords That Trigger Interactive Messages

Now these keywords will trigger the **interactive welcome message** instead of old text messages:

- `hi` / `hello` / `hey`
- `start` / `menu`
- `help` / `support` / `assist`

## 🔄 Interactive Flow Examples

### 1. Appointment Booking Flow
```
User types: "hi"
→ Interactive Welcome Message (3 buttons)
→ User clicks "📅 Book Appointment"
→ Appointment Type Selection (3 buttons)
→ User clicks "👩‍⚕️ General Checkup"
→ Doctor Selection List
→ User selects "Dr. Sharma"
→ Time Slot Selection (3 buttons)
→ User clicks "🕘 Mon 9:30 AM"
→ Appointment Confirmation (3 buttons)
→ User clicks "✅ Confirm & Pay"
→ Payment Link (3 buttons)
→ User clicks "✅ Payment Completed"
→ Appointment Confirmed! 🎉
```

### 2. Lab Test Flow
```
User types: "hello"
→ Interactive Welcome Message
→ User clicks "🧪 Lab Tests"
→ Lab Test Selection List
→ User selects "Blood Sugar Test"
→ Test booking and payment flow
```

### 3. Emergency Flow
```
User types: "help"
→ Interactive Welcome Message
→ User clicks "🚨 Emergency"
→ Emergency Options (3 buttons)
→ User selects appropriate emergency service
```

## 🧪 Testing Individual Components

### Check Available Interactive Messages
```bash
curl http://localhost:3000/api/message-library/messages/interactive
```

### Check Interactive Triggers
```bash
curl http://localhost:3000/api/message-library/triggers/interactive
```

### Get Buttons for a Specific Message
```bash
curl http://localhost:3000/api/message-library/messages/msg_welcome_interactive/buttons
```

### Test Trigger Lookup
```bash
curl -X POST http://localhost:3000/api/message-library/triggers/button \
  -H "Content-Type: application/json" \
  -d '{"buttonId": "btn_book_appointment"}'
```

## 🔧 Integration with WhatsApp

### For Real WhatsApp Integration:

1. **Set Environment Variables:**
```bash
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_VERSION=v22.0
```

2. **Configure Webhook:**
```bash
WEBHOOK_VERIFY_TOKEN=your_verify_token
WEBHOOK_APP_SECRET=your_app_secret
```

3. **Send Real Interactive Message:**
```bash
curl -X POST http://localhost:3000/api/message-library/test-send \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg_welcome_interactive",
    "phoneNumber": "+1234567890"
  }'
```

## 📊 What Changed

### ✅ Removed Old Messages:
- All old `standard_text` messages removed
- Old keyword triggers removed
- No more manual typing of keywords like "book", "sharma", "930", etc.

### ✅ New Interactive System:
- **Interactive buttons** replace text options
- **List selections** replace manual typing
- **Automatic flow** based on button clicks
- **Rich formatting** with emojis and headers

### ✅ Simplified Triggers:
- Only 2 keyword triggers remain: `hi/hello/hey/start/menu` and `help/support/assist`
- Both trigger the interactive welcome message
- All other interactions are button/list based

## 🎉 Benefits

1. **Better UX**: Users click buttons instead of typing
2. **No Typos**: Eliminates user typing errors
3. **Faster**: One-click interactions
4. **Professional**: Modern WhatsApp Business experience
5. **Guided**: Users can't get lost in the flow

## 🚨 Important Notes

- **Old text-based flows are completely removed**
- **All interactions now use buttons and lists**
- **Keywords like "book", "sharma", "930" no longer work**
- **Only "hi", "hello", "help" etc. trigger the interactive welcome**
- **Everything else is button/list driven**

Start with sending "hi" to see the new interactive experience! 🚀
