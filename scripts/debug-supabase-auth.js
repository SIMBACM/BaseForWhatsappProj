#!/usr/bin/env node

/**
 * Debug Supabase Authentication Issues
 * Tests different authentication methods and permissions
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugSupabaseAuth() {
  console.log('🔍 Debugging Supabase Authentication');
  console.log('====================================');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service Role Key: ${serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log(`🔑 Anon Key: ${anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');

  // Test 1: Service Role Client
  console.log('1️⃣ Testing Service Role Client...');
  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test listing buckets
    const { data: buckets, error: listError } = await serviceClient.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Service role bucket listing failed:', listError);
    } else {
      console.log('✅ Service role bucket listing successful');
      console.log(`📁 Found ${buckets.length} buckets:`, buckets.map(b => b.name));
    }
    
    // Test creating a small test file
    console.log('📤 Testing file upload with service role...');
    const testBuffer = Buffer.from('test image data');
    const testPath = `test/debug-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('feedback-images')
      .upload(testPath, testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Service role upload failed:', uploadError);
      console.error('   Error details:', {
        message: uploadError.message,
        status: uploadError.status,
        statusCode: uploadError.statusCode
      });
    } else {
      console.log('✅ Service role upload successful:', uploadData);
      
      // Clean up test file
      await serviceClient.storage.from('feedback-images').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Service role client error:', error);
  }
  
  console.log('');
  
  // Test 2: Alternative client configuration
  console.log('2️⃣ Testing Alternative Client Configuration...');
  try {
    const altClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: buckets2, error: listError2 } = await altClient.storage.listBuckets();
    
    if (listError2) {
      console.error('❌ Alternative client bucket listing failed:', listError2);
    } else {
      console.log('✅ Alternative client bucket listing successful');
    }
    
  } catch (error) {
    console.error('❌ Alternative client error:', error);
  }
  
  console.log('');
  
  // Test 3: Check JWT token validity
  console.log('3️⃣ Testing JWT Token Validity...');
  try {
    // Decode JWT to check if it's valid
    const tokenParts = serviceRoleKey.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('✅ JWT token structure is valid');
      console.log('📋 Token payload:', {
        iss: payload.iss,
        role: payload.role,
        iat: new Date(payload.iat * 1000).toISOString(),
        exp: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() > payload.exp * 1000
      });
      
      if (payload.role !== 'service_role') {
        console.warn('⚠️  Warning: Token role is not "service_role", it is:', payload.role);
      }
      
      if (Date.now() > payload.exp * 1000) {
        console.error('❌ Token is EXPIRED!');
      }
      
    } else {
      console.error('❌ JWT token format is invalid');
    }
    
  } catch (error) {
    console.error('❌ JWT token parsing error:', error);
  }
  
  console.log('');
  
  // Test 4: Check bucket permissions
  console.log('4️⃣ Testing Bucket Permissions...');
  try {
    const permClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Try to get bucket info
    const { data: bucketInfo, error: bucketError } = await permClient.storage
      .from('feedback-images')
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.error('❌ Bucket access failed:', bucketError);
    } else {
      console.log('✅ Bucket access successful');
      console.log(`📁 Bucket contains ${bucketInfo.length} items`);
    }
    
  } catch (error) {
    console.error('❌ Bucket permission test error:', error);
  }
  
  console.log('');
  console.log('🔧 Recommendations:');
  console.log('1. If JWT is expired, get a new service role key from Supabase dashboard');
  console.log('2. If role is not "service_role", make sure you copied the service role key, not anon key');
  console.log('3. If bucket access fails, check RLS policies on the storage bucket');
  console.log('4. Ensure the bucket "feedback-images" exists and is public');
}

debugSupabaseAuth().catch(console.error);