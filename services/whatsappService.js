const axios = require('axios');

/**
 * WhatsApp Business API Service
 */
class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    if (!this.accessToken) {
      console.warn('⚠️  WhatsApp access token not configured');
    }
    if (!this.phoneNumberId) {
      console.warn('⚠️  WhatsApp phone number ID not configured');
    }
  }

  /**
   * Test WhatsApp API connection
   */
  async testConnection() {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        success: true,
        phoneNumber: response.data.display_phone_number,
        verifiedName: response.data.verified_name,
        status: 'connected'
      };
    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorCode = errorData?.code;
      
      console.error('WhatsApp connection test failed:', error.response?.data || error.message);
      
      if (errorCode === 190) {
        console.error('🔑 ACCESS TOKEN EXPIRED! Please update WHATSAPP_ACCESS_TOKEN in your .env file');
        console.error('📝 Get a new token from: https://developers.facebook.com/apps/your-app-id/whatsapp-business/wa-dev-console/');
      }
      
      throw new Error(`WhatsApp API connection failed: ${errorData?.message || error.message} (Code: ${errorCode})`);
    }
  }



  /**
   * Send simple text message
   */
  async sendTextMessage(phoneNumber, text) {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: text
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        text,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorMessage = errorData?.message || error.message;
      const errorCode = errorData?.code;
      
      console.error('❌ Error sending text message:', error.response?.data || error.message);
      
      // Handle specific WhatsApp API errors
      if (errorCode === 190) {
        console.error('🔑 ACCESS TOKEN EXPIRED! Please update WHATSAPP_ACCESS_TOKEN in your .env file');
        console.error('📝 Get a new token from: https://developers.facebook.com/apps/your-app-id/whatsapp-business/wa-dev-console/');
      }
      
      throw new Error(`Failed to send text message: ${errorMessage} (Code: ${errorCode})`);
    }
  }
}

// Create service instance
const whatsappService = new WhatsAppService();



/**
 * Send text message (exported function)
 */
async function sendTextMessage(phoneNumber, text) {
  return await whatsappService.sendTextMessage(phoneNumber, text);
}

/**
 * Test WhatsApp connection (exported function)
 */
async function testWhatsAppConnection() {
  return await whatsappService.testConnection();
}

module.exports = {
  WhatsAppService,
  sendTextMessage,
  testWhatsAppConnection,
  whatsappService
};