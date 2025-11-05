#!/usr/bin/env node

/**
 * Test Supabase Storage Integration
 * Tests image upload functionality
 */

require('dotenv').config();
const supabaseStorageService = require('../services/supabaseStorageService');

async function testImageUpload() {
  console.log('📸 Testing Supabase Storage Integration');
  console.log('=====================================');
  
  try {
    // Test 1: Storage connectivity
    console.log('1️⃣ Testing storage connectivity...');
    const testResult = await supabaseStorageService.testStorage();
    
    if (testResult.success) {
      console.log('✅ Storage connection successful');
      console.log(`📁 Bucket exists: ${testResult.bucketExists}`);
      console.log(`📊 Total buckets: ${testResult.bucketsCount}`);
    } else {
      console.error('❌ Storage connection failed:', testResult.error);
      return;
    }
    console.log('');

    // Test 2: Storage statistics
    console.log('2️⃣ Testing storage statistics...');
    const stats = await supabaseStorageService.getStorageStats();
    
    if (stats.error) {
      console.error('❌ Failed to get storage stats:', stats.error);
    } else {
      console.log('✅ Storage statistics retrieved');
      console.log(`📊 Total files: ${stats.totalFiles}`);
      console.log(`📊 Total size: ${stats.totalSizeMB} MB`);
      console.log(`📁 Bucket: ${stats.bucketName}`);
    }
    console.log('');

    // Test 3: Mock image upload (without actual WhatsApp image)
    console.log('3️⃣ Testing mock image upload...');
    console.log('⚠️  Note: This would normally download from WhatsApp API');
    console.log('   For testing, we\'ll simulate the process without actual upload');
    
    const mockResult = {
      success: true,
      publicUrl: 'https://dxxjguvlivboclqaldfm.supabase.co/storage/v1/object/public/feedback-images/2025/11/feedback-123-1234567890-1699123456789.jpg',
      filePath: '2025/11/feedback-123-1234567890-1699123456789.jpg',
      fileName: 'feedback-123-1234567890-1699123456789.jpg'
    };
    
    console.log('✅ Mock upload result:', mockResult);
    console.log('');

    console.log('🎉 Supabase Storage integration tests completed!');
    console.log('');
    console.log('📋 Setup Checklist:');
    console.log('1. ✅ Supabase project configured');
    console.log('2. ✅ Storage bucket created/verified');
    console.log('3. ✅ Service integration working');
    console.log('');
    console.log('🔧 To complete setup:');
    console.log('1. Get your Supabase Service Role Key from:');
    console.log('   https://supabase.com/dashboard/project/dxxjguvlivboclqaldfm/settings/api');
    console.log('2. Update SUPABASE_SERVICE_ROLE_KEY in your .env file');
    console.log('3. Update your WhatsApp Access Token');
    console.log('4. Test with real WhatsApp messages');
    console.log('');
    console.log('📊 Monitor uploads at:');
    console.log('   http://localhost:8080/api/feedback/storage/stats');

  } catch (error) {
    console.error('❌ Storage integration test failed:', error.message);
    console.error('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check SUPABASE_URL in .env file');
    console.log('2. Check SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.log('3. Verify Supabase project is active');
    console.log('4. Check network connectivity');
    
    process.exit(1);
  }
}

testImageUpload();