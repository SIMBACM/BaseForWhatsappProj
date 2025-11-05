#!/usr/bin/env node

/**
 * Test Actual Upload Process
 * Simulates the exact same upload process that's failing
 */

require('dotenv').config();
const supabaseStorageService = require('../services/supabaseStorageService');

async function testActualUpload() {
  console.log('🧪 Testing Actual Upload Process');
  console.log('================================');
  
  try {
    // Create a test image buffer (simulating downloaded WhatsApp image)
    const testImageBuffer = Buffer.from('fake-image-data-for-testing-' + Date.now());
    console.log(`📸 Created test image buffer: ${testImageBuffer.length} bytes`);
    
    // Test the exact same process that's failing
    console.log('📤 Testing uploadWhatsAppImage method...');
    
    // Mock the internal methods to avoid WhatsApp API calls
    const originalGetUrl = supabaseStorageService.getWhatsAppImageUrl;
    const originalDownload = supabaseStorageService.downloadImageFromUrl;
    
    // Mock the methods
    supabaseStorageService.getWhatsAppImageUrl = async (imageId) => {
      console.log(`🔄 Mock: Getting WhatsApp URL for ${imageId}`);
      return 'https://mock-whatsapp-url.com/image.jpg';
    };
    
    supabaseStorageService.downloadImageFromUrl = async (url) => {
      console.log(`🔄 Mock: Downloading from ${url}`);
      return testImageBuffer;
    };
    
    // Test the upload
    const result = await supabaseStorageService.uploadWhatsAppImage(
      'test-image-id-123',
      '+919961729719',
      999
    );
    
    // Restore original methods
    supabaseStorageService.getWhatsAppImageUrl = originalGetUrl;
    supabaseStorageService.downloadImageFromUrl = originalDownload;
    
    console.log('📋 Upload result:', result);
    
    if (result.success) {
      console.log('✅ Upload test successful!');
      console.log(`🔗 Public URL: ${result.publicUrl}`);
      
      // Try to clean up the test file
      try {
        const { createClient } = require('@supabase/supabase-js');
        const cleanupClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await cleanupClient.storage.from('feedback-images').remove([result.filePath]);
        console.log('🧹 Test file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️  Could not clean up test file:', cleanupError.message);
      }
      
    } else {
      console.error('❌ Upload test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testActualUpload();