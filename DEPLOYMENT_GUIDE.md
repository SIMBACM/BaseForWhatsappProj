# WhatsApp Feedback Collection System - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites

- Node.js >= 16.0.0
- WhatsApp Business API Account
- Meta Developer Account
- Railway Account (or similar hosting)

### Environment Variables

Create a `.env` file with the following variables:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_API_VERSION=v22.0

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=your_secure_webhook_token

# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# CORS Configuration (for development)
FRONTEND_URL=http://localhost:5173
```

### Local Development

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd whatsapp-feedback-system
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Start Development Server**
```bash
npm run dev
# or
npm start
```

4. **Test the System**
```bash
# Test server health
curl http://localhost:3001/health

# Test complete feedback flow
node test/feedbackCollectionTest.js
```

### Production Deployment (Railway)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select this project

2. **Configure Environment Variables**
   - Add all environment variables from `.env.example`
   - Set `NODE_ENV=production`
   - Set `HOST=0.0.0.0`

3. **Deploy**
   - Railway will automatically deploy on push
   - Note your deployment URL (e.g., `https://your-app.up.railway.app`)

### WhatsApp Business API Setup

1. **Configure Webhook**
   - Go to Meta Developer Console
   - Navigate to WhatsApp → Configuration → Webhooks
   - Set Callback URL: `https://your-app.up.railway.app/webhook`
   - Set Verify Token: (same as `WEBHOOK_VERIFY_TOKEN`)
   - Subscribe to: `messages`

2. **Test Webhook**
   - Send "hi" to your WhatsApp Business number
   - Check server logs for processing confirmation

## 🧪 Testing

### Automated Tests

```bash
# Run all tests
node test/feedbackCollectionTest.js

# Run specific test scenarios
node test/feedbackCollectionTest.js complete
node test/feedbackCollectionTest.js steps
node test/feedbackCollectionTest.js errors
```

### Manual Testing

1. **Start Feedback Flow**
   ```bash
   curl -X POST http://localhost:3001/webhook/test-text \
     -H "Content-Type: application/json" \
     -d '{"message": "hi", "phoneNumber": "+1234567890"}'
   ```

2. **Test Complete Flow**
   ```bash
   curl -X POST http://localhost:3001/webhook/test-feedback-flow \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "+1234567890",
       "name": "John Doe", 
       "feedback": "Great service!"
     }'
   ```

### Real WhatsApp Testing

1. Send "hi" to your WhatsApp Business number
2. Follow the conversation prompts:
   - Provide your name
   - Share your feedback
   - Send a profile picture
3. Check server console for logged feedback data

## 📊 Monitoring

### Health Checks

- **Health Endpoint**: `GET /health`
- **Server Info**: `GET /`
- **WhatsApp Config**: `GET /api/whatsapp/config`

### Console Logging

Completed feedback is logged in this format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userPhone": "+1234567890",
  "name": "John Doe",
  "feedback": "Great service!",
  "profileImageUrl": "whatsapp-image-id",
  "sessionDuration": "5 minutes"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Check `WEBHOOK_VERIFY_TOKEN` matches Meta console
   - Ensure webhook URL is correct

2. **Messages Not Sending**
   - Verify `WHATSAPP_ACCESS_TOKEN` is valid
   - Check phone number is in allowed recipients (for test apps)
   - Ensure 24-hour message window is open

3. **Session Not Working**
   - Check server logs for session creation
   - Verify conversation manager is initialized
   - Test with different phone numbers

### Debug Commands

```bash
# Check server logs
railway logs  # (for Railway deployment)

# Test webhook locally with ngrok
ngrok http 3001
# Use ngrok URL for webhook testing

# Validate environment variables
node -e "console.log(process.env.WHATSAPP_ACCESS_TOKEN ? 'Token set' : 'Token missing')"
```

## 🔄 Future Enhancements

### Database Integration

To add database storage (replace console logging):

1. **Install Prisma**
   ```bash
   npm install prisma @prisma/client
   ```

2. **Create Schema**
   ```prisma
   model Feedback {
     id          Int      @id @default(autoincrement())
     userPhone   String
     name        String
     feedback    String
     imageUrl    String?
     createdAt   DateTime @default(now())
   }
   ```

3. **Update Conversation Manager**
   ```javascript
   // Replace console.log with database save
   await prisma.feedback.create({
     data: {
       userPhone,
       name: session.name,
       feedback: session.feedback,
       imageUrl: session.profileImageUrl
     }
   });
   ```

### Additional Features

- **Multi-language Support**: Add language detection and localized templates
- **Analytics Dashboard**: Web interface for viewing collected feedback
- **Export Functionality**: CSV/Excel export of feedback data
- **Notification System**: Email/SMS alerts for new feedback
- **Custom Fields**: Additional data collection steps

## 📞 Support

For issues and questions:
- Check server logs first
- Test with the provided test suite
- Verify WhatsApp Business API credentials
- Review Meta Developer documentation

---

Your WhatsApp Feedback Collection System is now ready for production use! 🎉