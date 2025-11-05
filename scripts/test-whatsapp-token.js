#!/usr/bin/env node

/**
 * Test WhatsApp Access Token Validity
 * Run this script to check if your token is working
 */

require('dotenv').config();
const { testWhatsAppConnection } = require('../services/whatsappService');

async function testToken() {
  console.log('🔍 Testing WhatsApp Access Token...');
  console.log('=====================================');
  
  // Check if token is configured
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!token) {
    console.error('❌ WHATSAPP_ACCESS_TOKEN not found in .env file');
    return;
  }
  
  if (!phoneId) {
    console.error('❌ WHATSAPP_PHONE_NUMBER_ID not found in .env file');
    return;
  }
  
  console.log(`📱 Phone Number ID: ${phoneId}`);
  console.log(`🔑 Token (first 20 chars): ${token.substring(0, 20)}...`);
  console.log('');
  
  try {
    const result = await testWhatsAppConnection();
    
    console.log('✅ WhatsApp API Connection Successful!');
    console.log('======================================');
    console.log(`📞 Phone Number: ${result.phoneNumber}`);
    console.log(`✅ Verified Name: ${result.verifiedName}`);
    console.log(`🟢 Status: ${result.status}`);
    console.log('');
    console.log('🎉 Your token is valid and working!');
    
  } catch (error) {
    console.error('❌ WhatsApp API Connection Failed!');
    console.error('==================================');
    console.error(`Error: ${error.message}`);
    console.log('');
    
    if (error.message.includes('190')) {
      console.log('🔧 How to fix:');
      console.log('1. Go to https://developers.facebook.com/');
      console.log('2. Select your WhatsApp app');
      console.log('3. Go to WhatsApp → API Setup');
      console.log('4. Generate a new temporary access token');
      console.log('5. Update WHATSAPP_ACCESS_TOKEN in your .env file');
      console.log('6. Restart your server');
    }
  }
}

testToken();