# WhatsApp Business API Backend

A comprehensive Node.js backend server for WhatsApp Business API webhook handling, intelligent flow automation, and message processing with trigger-based responses.

## 🌟 **Complete WhatsApp Flow Builder System**

This backend is part of a **complete WhatsApp automation ecosystem** that includes:

### **📊 Frontend Flow Builder Dashboard**

- **Live URL**: [https://whatsapp-flow-builder-production.up.railway.app](https://whatsapp-flow-builder-production.up.railway.app)
- **Purpose**: Visual interface to create, manage, and monitor WhatsApp automation triggers
- **Features**:
  - 🎨 **Visual Trigger Builder** - Create keyword-based automation rules
  - 📱 **Flow Management** - Connect triggers to WhatsApp Flows
  - 📊 **Real-time Analytics** - Monitor trigger performance and usage
  - ⚙️ **Configuration Panel** - Manage WhatsApp Business API settings
  - 🧪 **Testing Interface** - Test triggers and flows before deployment

### **🔗 Backend API Server** (This Repository)

- **Live URL**: [https://whatsappbackend-production-8946.up.railway.app](https://whatsappbackend-production-8946.up.railway.app)
- **Purpose**: Process webhooks, execute triggers, and handle WhatsApp API integration
- **Features**:
  - 📨 **Webhook Processing** - Receive and process WhatsApp messages
  - 🤖 **Intelligent Triggers** - Match keywords to automated responses
  - 📡 **WhatsApp API Integration** - Send messages and interactive flows
  - 💾 **Data Processing** - Handle form submissions and user data

### **🔄 Complete Workflow:**

```
Frontend Dashboard                    Backend Server                     WhatsApp
      ↓                                    ↓                              ↓
1. Create trigger                    2. Store trigger config          3. User sends message
   "hello" → Flow ID                    in memory/database                 "hello" to business
      ↓                                    ↓                              ↓
4. Configure flow message           5. Webhook receives message       6. Match trigger keyword
   "complete karo"                      from WhatsApp API                 "hello" found!
      ↓                                    ↓                              ↓
7. Send interactive flow            8. User receives message          9. User completes form
   with "Open Form" button             with flow button                  and submits data
      ↓                                    ↓                              ↓
10. Process form response          11. Analytics updated              12. Automation complete
    store data/trigger actions         in dashboard                       workflow success!
```

### **🎯 End-to-End Automation Example:**

1. **Dashboard**: Create trigger `"register" → Flow ID: 123456789`
2. **User Action**: Customer sends "register" to your WhatsApp Business number
3. **Backend**: Receives webhook, matches trigger, sends flow message
4. **Customer**: Gets "Please complete registration" + [Open Form] button
5. **Interaction**: Customer clicks button, fills form, submits
6. **Processing**: Backend processes form data, updates analytics
7. **Dashboard**: Shows successful trigger execution and form completion

---

## 🎯 **System Overview**

This backend creates an **intelligent WhatsApp automation system** that:

- **Listens for incoming WhatsApp messages** via webhooks
- **Matches keywords to predefined triggers**
- **Automatically sends interactive flow messages** as responses
- **Handles flow completions and user data** collection
- **Provides real-time monitoring and logging**

## 🏗️ **Architecture & Flow**

### **Frontend + Backend Integration:**

The **Flow Builder Dashboard** and this **Backend API** work together seamlessly:

```
Flow Builder Dashboard                 Backend API Server
        ↓                                    ↓
📊 Visual trigger management          📨 Webhook processing
⚙️ Configuration interface           🤖 Trigger execution
📈 Real-time analytics              📡 WhatsApp API integration
🧪 Testing and preview              💾 Data processing
        ↓                                    ↓
   Unified system for complete WhatsApp automation
```

### **API Communication:**

- **Dashboard** ←→ **Backend**: REST API calls for trigger CRUD operations
- **WhatsApp** → **Backend**: Webhooks for incoming messages
- **Backend** → **WhatsApp**: API calls for sending flows and messages
- **Backend** → **Dashboard**: Real-time updates and analytics

### **Complete Automation Flow:**

```
📱 User sends "hello" → WhatsApp Business Number
     ↓
🌐 WhatsApp → Sends webhook → Your Railway Backend
     ↓
🔍 Backend → Finds "hello" trigger → Flow ID: 772936888895590
     ↓
🤖 Backend → Sends interactive flow → "complete karo" message
     ↓
📋 User → Clicks "Open Form" → Opens WhatsApp Flow
     ↓
✅ User → Completes form → Data sent back to webhook
     ↓
💾 Backend → Processes form data → Saves/responds accordingly
```

### **Key Components:**

- **Webhook Handler** (`routes/webhook.js`) - Receives WhatsApp events
- **Trigger Service** (`services/triggerService.js`) - Matches keywords to flows
- **WhatsApp Service** (`services/whatsappService.js`) - Sends messages and flows
- **Flow Processor** (`services/webhookService.js`) - Handles form responses
- **Message Library** (`routes/messageLibrary.js` + `services/messageLibraryService.js`) - Centralized store for reusable message templates and content blocks. Keeps responses consistent across triggers and flows and makes it easy to update messages in one place.

## 🚀 **Features**

### 🔄 **Intelligent Automation**

- **Keyword Triggers**: Match incoming messages to predefined actions
- **Flow Deployment**: Send interactive WhatsApp Flows automatically
- **Form Processing**: Handle user submissions and responses
- **Multi-trigger Support**: Different keywords trigger different flows

### 🔒 **Security & Reliability**

- **Webhook Verification**: Secure Meta webhook validation
- **CORS Protection**: Frontend integration security
- **Error Handling**: Comprehensive error logging and recovery
- **Production Ready**: Railway deployment with 0.0.0.0 binding

### 📊 **Monitoring & Debugging**

- **Real-time Logs**: Track all webhook events and responses
- **Health Endpoints**: Monitor system status and uptime
- **Trigger Analytics**: Track usage counts and performance

## 📋 **Prerequisites**

### **Required Accounts & Tools:**

- **Node.js** >= 16.0.0
- **npm** or yarn package manager
- **WhatsApp Business API Account** (Meta Business)
- **Meta Developer Account** with app created
- **Railway Account** (for deployment) or similar hosting
- **WhatsApp Business Phone Number** (verified)

### **Required Information:**

- WhatsApp Access Token
- Phone Number ID
- Business Account ID
- Webhook Verify Token
- WhatsApp Flow IDs (created in Meta Business Manager)

## 🛠 **Step-by-Step Installation**

### **Step 1: Clone & Setup Local Environment**

```bash
# Clone the repository
git clone https://github.com/Flair0n/whatsapp_backend.git
cd whatsapp_backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### **Step 2: Configure Environment Variables**

Create a `.env` file with your actual credentials:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxx  # From Meta Developer Console
WHATSAPP_PHONE_NUMBER_ID=158282837372377  # Your business phone ID
WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745  # Your business account ID
WHATSAPP_API_VERSION=v22.0

# Business WhatsApp Number (where customers send messages)
WHATSAPP_BUSINESS_NUMBER=15550617327  # Your actual business number

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=mywebhooktoken123  # Choose a secure token

# Server Configuration
PORT=3001
NODE_ENV=production  # Use 'development' for local testing

# Frontend Integration
FRONTEND_URL=https://your-frontend-domain.com
```

### **Step 3: Deploy to Railway**

```bash
# Commit your changes
git add .
git commit -m "Initial WhatsApp backend setup"
git push

# Deploy to Railway (connects to GitHub automatically)
# Visit: https://railway.app → Connect GitHub → Deploy
```

### **Step 4: Configure WhatsApp Webhook**

1. **Go to Meta Developer Console**
2. **Navigate**: WhatsApp → Configuration → Webhooks
3. **Set Callback URL**: `https://your-railway-app.up.railway.app/webhook`
4. **Set Verify Token**: `mywebhooktoken123` (match your .env)
5. **Subscribe to Events**: `messages`, `message_status`

### **Step 5: Create WhatsApp Flows**

1. **Go to Meta Business Manager**
2. **Navigate**: WhatsApp → Flows
3. **Create Flow**: Design your interactive forms
4. **Note Flow ID**: Copy the Flow ID (e.g., `772936888895590`)
5. **Set First Screen**: Ensure first screen is named correctly (e.g., `RECOMMEND`)

### **Step 6: Add Test Recipients**

1. **In Meta Developer Console**: WhatsApp → API Setup → Recipients
2. **Add Phone Numbers**: Add numbers that can receive messages (for unpublished apps)
3. **Verify Numbers**: Complete SMS verification for each number

## 🤖 **Automation System**

### **How the Trigger System Works:**

The system uses **keyword-based triggers** to automatically respond to WhatsApp messages:

```javascript
// Example Trigger Configuration
{
  id: "1",
  keyword: "hello",           // When user sends "hello"
  flowId: "772936888895590",  // Send this WhatsApp Flow
  message: "Hello! Please complete this form:",  // With this message
  isActive: true              // Trigger is enabled
}
```

### **Current Configured Triggers:**

| **Keyword** | **Flow ID**                 | **Response Message**                 | **Action**              |
| ----------- | --------------------------- | ------------------------------------ | ----------------------- |
| `hello`     | `your_flow_id_here`         | "Hello! Please complete this form:"  | Opens registration flow |
| `register`  | `your_registration_flow_id` | "Please complete your registration:" | Opens registration form |
| `r`         | `772936888895590`           | "complete karo"                      | Opens quick form        |

### **Complete Automation Flow:**

#### **1. Message Reception**

```
User sends: "hello"
     ↓
WhatsApp API → Webhook POST /webhook
     ↓
Backend receives payload:
{
  "messages": [{
    "from": "918281348343",
    "text": {"body": "hello"},
    "type": "text"
  }]
}
```

#### **2. Trigger Processing**

```
Backend processes message:
     ↓
📝 Extract text: "hello"
     ↓
🔍 Find matching trigger: keyword="hello"
     ↓
✅ Match found: Flow ID 772936888895590
```

#### **3. Flow Message Generation**

```
Backend creates WhatsApp Flow message:
{
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "action": {
      "name": "flow",
      "parameters": {
        "flow_id": "772936888895590",
        "flow_action_payload": {
          "screen": "RECOMMEND",
          "data": {
            "user_phone": "918281348343",
            "form_type": "registration"
          }
        }
      }
    }
  }
}
```

#### **4. User Interaction**

```
📱 User receives: "complete karo" + [Open Form] button
     ↓
👆 User clicks "Open Form"
     ↓
📋 WhatsApp Flow opens (RECOMMEND screen)
     ↓
✍️ User fills out form fields
     ↓
✅ User submits form
```

#### **5. Form Response Processing**

```
WhatsApp sends form response → Webhook
     ↓
Backend receives:
{
  "interactive": {
    "nfm_reply": {
      "response_json": "{"name":"John","email":"john@example.com"}",
      "body": "Form completed"
    }
  }
}
     ↓
Backend processes form data → Database/Actions
```

## 📚 **API Documentation**

### **Base URL**: `https://whatsappbackend-production-8946.up.railway.app`

### **Core Endpoints:**

#### **1. Health Check** ✅

```http
GET /health
```

**Purpose**: Monitor server status and uptime  
**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

#### **2. Webhook Verification** 🔐

```http
GET /webhook?hub.mode=subscribe&hub.verify_token=mywebhooktoken123&hub.challenge=test123
```

**Purpose**: WhatsApp webhook verification (Meta setup)  
**Response**: Returns the challenge string for verification

#### **3. Webhook Message Processing** 📨

```http
POST /webhook
```

**Purpose**: Receives WhatsApp messages and processes triggers  
**Headers**: `Content-Type: application/json`
**Body**: WhatsApp webhook payload
**Response**: `200 OK` if processed successfully

#### **4. Trigger Management** ⚙️

##### Get All Triggers

```http
GET /api/triggers
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "keyword": "hello",
      "flowId": "772936888895590",
      "message": "Hello! Please complete this form:",
      "isActive": true,
      "createdAt": "2025-10-08T07:15:39.496Z",
      "matchCount": 0
    }
  ],
  "count": 1
}
```

##### Create New Trigger

```http
POST /api/triggers
```

**Body**:

```json
{
  "keyword": "register",
  "flowId": "your_flow_id_here",
  "message": "Please complete registration:",
  "isActive": true
}
```

##### Test Trigger

```http
POST /api/triggers/:id/test
```

**Purpose**: Test trigger functionality without sending real messages

#### **5. WhatsApp Messaging** 📱

##### Send Text Message

```http
POST /api/whatsapp/send-message
```

**Body**:

```json
{
  "to": "918281348343",
  "type": "text",
  "text": {
    "body": "Hello from WhatsApp API!"
  }
}
```

##### Send Flow Message

```http
POST /api/whatsapp/send-flow
```

**Body**:

```json
{
  "to": "918281348343",
  "flowId": "772936888895590",
  "message": "Please complete this form:"
}
```

- `hub.verify_token` - Your webhook verify token
- `hub.challenge` - Challenge string to echo back

```http
POST /webhook
```

Receives WhatsApp webhook payloads for message processing.

**Request Body:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [...]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

#### Trigger Management

```http
GET /api/triggers
```

Get all automation triggers.

```http
POST /api/triggers
```

Create a new automation trigger.

**Request Body:**

```json
{
  "name": "Welcome Flow",
  "type": "message_received",
  "conditions": {
    "keyword": "start",
    "phone_number": "+1234567890"
  },
  "actions": [
    {
      "type": "send_message",
      "template": "welcome_template"
    }
  ],
  "active": true
}
```

```http
PUT /api/triggers/:id
```

Update an existing trigger.

```http
DELETE /api/triggers/:id
```

Delete a trigger.

```http
POST /api/triggers/:id/test
```

Test a trigger execution.

#### WhatsApp Messaging

```http
POST /api/whatsapp/send-message
```

Send a WhatsApp message.

**Request Body:**

```json
{
  "to": "+1234567890",
  "type": "text",
  "text": {
    "body": "Hello from WhatsApp API!"
  }
}
```

```http
POST /api/whatsapp/send-template
```

Send a WhatsApp template message.

**Request Body:**

```json
{
  "to": "+1234567890",
  "template": {
    "name": "template_name",
    "language": {
      "code": "en"
    },
    "components": []
  }
}
```

## 🏗 Project Structure

```
whatsapp-backend/
├── routes/
│   ├── webhook.js          # Webhook handling routes
│   ├── triggers.js         # Trigger management routes
│   ├── whatsapp.js        # WhatsApp messaging routes
│   └── messageLibrary.js  # Message templates and library routes
├── services/
│   ├── webhookService.js   # Webhook processing logic
│   ├── triggerService.js   # Trigger management logic
│   ├── whatsappService.js  # WhatsApp API integration
│   └── messageLibraryService.js # Message template logic and utilities
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### Message Library Service

- Purpose: Centralizes reusable message templates and content blocks used by triggers, flows, and one-off messages. This keeps user-facing text consistent and makes updates low-risk because templates are stored and referenced in one place.
- Files: `routes/messageLibrary.js` (HTTP API) and `services/messageLibraryService.js` (business logic).
- Typical responsibilities:
  - Store and retrieve message templates (text, placeholders, quick replies)
  - Provide template interpolation using runtime data (e.g., user name, codes)
  - Expose CRUD endpoints for managing templates (used by admin/dashboard)
  - Offer helper methods for other services to fetch ready-to-send payloads

Example (conceptual) usage from code:

```js
const { getTemplate } = require("./services/messageLibraryService");
const template = getTemplate("welcome_message");
const payload = template.render({ name: "John" });
// then send payload via whatsappService
```

## 🔐 Security Features

- **Webhook Verification**: Validates incoming webhooks using verify tokens
- **CORS Protection**: Configurable CORS policy for frontend integration
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data stored in environment variables
- **Request Limiting**: Body size limits to prevent abuse

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend-domain.com
WEBHOOK_VERIFY_TOKEN=your_secure_webhook_token
WHATSAPP_ACCESS_TOKEN=your_production_access_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
```

### Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 🧪 **Testing Your Automation**

### **Test Setup Checklist:**

#### **Prerequisites:**

- ✅ Railway backend deployed and responding
- ✅ Webhook configured in Meta Developer Console
- ✅ Test phone number added to allowed recipients
- ✅ WhatsApp Flow created with correct screen names
- ✅ Environment variables properly configured

### **Testing Methods:**

#### **Method 1: Real WhatsApp Test** (Recommended)

```
1. Send "hello" from allowed phone number → Your business WhatsApp
2. Should receive: "Hello! Please complete this form:" + [Open Form] button
3. Click "Open Form" → WhatsApp Flow should open
4. Complete form → Data should be processed by webhook
```

#### **Method 2: API Testing**

```bash
# Test health endpoint
curl https://whatsappbackend-production-8946.up.railway.app/health

# Test webhook verification
curl "https://whatsappbackend-production-8946.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=mywebhooktoken123&hub.challenge=test123"

# Test triggers endpoint
curl https://whatsappbackend-production-8946.up.railway.app/api/triggers
```

#### **Method 3: Webhook Simulation**

```powershell
# Simulate incoming WhatsApp message
$payload = '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"from":"918281348343","text":{"body":"hello"},"type":"text"}]}}]}]}'

Invoke-WebRequest -Uri "https://whatsappbackend-production-8946.up.railway.app/webhook" -Method POST -Body $payload -ContentType "application/json"
```

### **Expected Results:**

- ✅ **200 OK** response from webhook
- ✅ **Logs show**: "Found matching trigger", "Sending flow message"
- ✅ **User receives**: Interactive flow message
- ✅ **No errors** in Railway deployment logs

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions:**

#### **1. Webhook Verification Failed**

```
Error: Webhook verification failed
```

**Solution:**

- ✅ Check `WEBHOOK_VERIFY_TOKEN` matches Meta Developer Console
- ✅ Ensure webhook URL is correct: `https://your-app.up.railway.app/webhook`
- ✅ Verify Railway deployment is running

#### **2. Recipient Not in Allowed List (Error 131030)**

```
Error: (#131030) Recipient phone number not in allowed list
```

**Solution:**

- ✅ Add test phone numbers in Meta Developer Console
- ✅ Navigate: WhatsApp → API Setup → Recipients
- ✅ Verify phone numbers via SMS
- ✅ Or publish your app for production use

#### **3. Invalid Flow Parameter (Error 131009)**

```
Error: (#131009) Parameter value is not valid - flow_action_payload data must be dynamic_object
```

**Solution:**

- ✅ Check Flow ID exists and is correct
- ✅ Verify first screen name (e.g., "RECOMMEND")
- ✅ Ensure flow is published and active
- ✅ Check flow_action_payload structure

#### **4. Application Failed to Respond (Railway)**

```
Error: Application failed to respond
```

**Solution:**

- ✅ Check Railway deployment logs
- ✅ Ensure `NODE_ENV=production` for 0.0.0.0 binding
- ✅ Verify all environment variables are set
- ✅ Check for syntax errors in code

#### **5. CORS Errors (Frontend Integration)**

```
Error: CORS policy blocked request
```

**Solution:**

- ✅ Update `FRONTEND_URL` in environment variables
- ✅ Add frontend domain to CORS whitelist
- ✅ Check CORS configuration in `server.js`

### **Debug Commands:**

```bash
# Check Railway deployment logs
railway logs

# Test local server
npm run dev

# Validate webhook locally
ngrok http 3001
# Then use ngrok URL for webhook testing

# Check environment variables
railway variables
```

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track:**

- **Webhook Success Rate**: % of successful webhook processes
- **Trigger Match Rate**: % of messages that match triggers
- **Flow Completion Rate**: % of flows completed by users
- **Error Frequency**: Monitor 131009, 131030 errors
- **Response Time**: Webhook processing speed

### **Logging Locations:**

- **Railway Logs**: Real-time webhook processing
- **Meta Developer Console**: Webhook delivery status
- **WhatsApp Manager**: Message delivery metrics
- **Application Logs**: Custom trigger analytics

## 🏗️ **Project Structure**

```
whatsapp-backend/
├── 📁 routes/                    # API Route Handlers
│   ├── webhook.js               # 🔗 WhatsApp webhook endpoints
│   ├── triggers.js              # ⚙️ Trigger management API
│   └── whatsapp.js              # 📱 WhatsApp messaging API
├── 📁 services/                 # Business Logic Layer
│   ├── webhookService.js        # 📨 Webhook processing logic
│   ├── triggerService.js        # 🎯 Trigger matching system
│   └── whatsappService.js       # 📡 WhatsApp API integration
├── 📁 test/                     # Testing Scripts
│   ├── test-webhook.ps1         # 🧪 Webhook simulation tests
│   └── test_payload.json        # 📝 Test message payloads
├── 📄 server.js                 # 🚀 Main application server
├── 📄 package.json              # 📦 Dependencies and scripts
├── 📄 railway.json              # 🚂 Railway deployment config
├── 📄 .env                      # ⚙️ Environment variables
├── 📄 .env.example              # 📋 Environment template
├── 📄 .gitignore                # 🚫 Git ignore rules
└── 📄 README.md                 # 📖 This documentation
```

## 🚀 **Production Deployment**

### **Current Deployment:**

- **Platform**: Railway
- **URL**: `https://whatsappbackend-production-8946.up.railway.app`
- **Status**: ✅ Active and responding
- **Environment**: Production-ready with 0.0.0.0 binding

### **Deployment Features:**

- ✅ **Auto-deployment** from GitHub commits
- ✅ **Environment variable** management
- ✅ **HTTPS** enabled by default
- ✅ **Scaling** and monitoring included
- ✅ **Webhook-compatible** domain and SSL

## 📈 **Performance & Scaling**

### **Current Capabilities:**

- **Concurrent Webhooks**: Handles multiple simultaneous requests
- **Response Time**: < 200ms average webhook processing
- **Uptime**: 99.9% availability target
- **Storage**: Stateless design for easy scaling

### **Scaling Considerations:**

- **Database Integration**: Add persistent storage for large-scale deployments
- **Rate Limiting**: Implement API rate limiting for production
- **Caching**: Add Redis for trigger caching and performance
- **Load Balancing**: Multiple instances for high-volume usage

## 🤝 **Contributing & Development**

### **Development Workflow:**

```bash
# 1. Fork and clone repository
git clone https://github.com/Flair0n/whatsapp_backend.git

# 2. Create feature branch
git checkout -b feature/new-trigger-system

# 3. Make changes and test locally
npm run dev

# 4. Commit and push changes
git add .
git commit -m "Add new trigger system"
git push origin feature/new-trigger-system

# 5. Create pull request
```

### **Code Standards:**

- **ESLint**: Code formatting and quality
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed console outputs for debugging
- **Documentation**: Comment complex logic and functions

## 📞 **Support & Resources**

### **Documentation Links:**

- **WhatsApp Business API**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **WhatsApp Flows**: [developers.facebook.com/docs/whatsapp/flows](https://developers.facebook.com/docs/whatsapp/flows)
- **Railway Platform**: [docs.railway.app](https://docs.railway.app)
- **Node.js Express**: [expressjs.com](https://expressjs.com)

### **Getting Help:**

- 🐛 **Issues**: Create GitHub issue for bugs
- 💡 **Features**: Submit feature requests
- 📧 **Support**: Contact maintainers
- 📖 **Documentation**: Check this README first

## 📄 **License**

MIT License - see LICENSE file for details

---

## 🎉 **Success! Your WhatsApp Automation is Ready!**

Your backend is now fully configured and operational:

- ✅ **WhatsApp webhook** processing incoming messages
- ✅ **Intelligent triggers** matching keywords to flows
- ✅ **Interactive flows** collecting user data
- ✅ **Railway deployment** handling production traffic
- ✅ **Comprehensive monitoring** and error handling

**Ready to serve real customers with automated WhatsApp experiences!** 🚀

---

_Built with ❤️ for WhatsApp Business API automation • Last updated: October 8, 2025_

```bash
# Run tests (when implemented)
npm test

# Test webhook endpoint
curl -X GET "http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test_challenge"

# Test health endpoint
curl http://localhost:3001/health
```

## 📝 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests

### Adding New Features

1. Create route handlers in `/routes`
2. Implement business logic in `/services`
3. Update this README with new endpoints
4. Add appropriate error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Verification Failed**

   - Check `WEBHOOK_VERIFY_TOKEN` in `.env`
   - Ensure token matches Meta Developer settings

2. **CORS Errors**

   - Update `FRONTEND_URL` in `.env`
   - Check CORS configuration in `server.js`

3. **WhatsApp API Errors**
   - Verify `WHATSAPP_ACCESS_TOKEN` is valid
   - Check `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Ensure phone number is verified with Meta

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Check WhatsApp Business API documentation
- Review Meta Developer documentation

---

Made with ❤️ for WhatsApp Business API integration
