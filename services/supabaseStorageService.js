/**
 * Supabase Storage Service for WhatsApp Feedback Images
 * Handles uploading and managing profile pictures in Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

class SupabaseStorageService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = 'feedback-images';
    
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      console.warn('⚠️  Supabase credentials not configured. Image upload will be disabled.');
      this.supabase = null;
      return;
    }
    
    // Create Supabase client with service role key for admin operations
    this.supabase = createClient(this.supabaseUrl, this.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Authorization': `Bearer ${this.serviceRoleKey}`
        }
      }
    });
    
    console.log('🗄️ Supabase Storage service initialized');
    
    // Initialize bucket on startup
    this.initializeBucket();
  }

  /**
   * Initialize the feedback-images bucket if it doesn't exist
   */
  async initializeBucket() {
    if (!this.supabase) return;
    
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError);
        return;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.log(`📁 Creating bucket: ${this.bucketName}`);
        
        const { data, error } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true, // Make images publicly accessible
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB limit
        });
        
        if (error) {
          console.error('❌ Error creating bucket:', error);
        } else {
          console.log(`✅ Bucket '${this.bucketName}' created successfully`);
        }
      } else {
        console.log(`✅ Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      console.error('❌ Error initializing bucket:', error);
    }
  }

  /**
   * Download image from WhatsApp and upload to Supabase Storage
   * @param {string} whatsappImageId - WhatsApp image ID
   * @param {string} userPhone - User's phone number
   * @param {number} feedbackId - Feedback record ID
   * @returns {object} Upload result with public URL
   */
  async uploadWhatsAppImage(whatsappImageId, userPhone, feedbackId) {
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      console.warn('⚠️  Supabase not configured, skipping image upload');
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      console.log(`📸 Processing WhatsApp image: ${whatsappImageId} for user ${userPhone}`);
      
      // Step 1: Get WhatsApp image URL
      const imageUrl = await this.getWhatsAppImageUrl(whatsappImageId);
      if (!imageUrl) {
        throw new Error('Failed to get WhatsApp image URL');
      }
      
      // Step 2: Download image from WhatsApp
      const imageBuffer = await this.downloadImageFromUrl(imageUrl);
      if (!imageBuffer) {
        throw new Error('Failed to download image from WhatsApp');
      }
      
      // Step 3: Generate file path
      const fileName = this.generateFileName(userPhone, feedbackId, whatsappImageId);
      const filePath = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${fileName}`;
      
      // Step 4: Create fresh Supabase client for upload (to avoid token issues)
      console.log(`🔧 Creating fresh Supabase client for upload...`);
      console.log(`🔑 Using service role key: ${this.serviceRoleKey.substring(0, 20)}...`);
      
      const uploadClient = createClient(this.supabaseUrl, this.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      console.log(`📤 Uploading to path: ${filePath}`);
      
      // Step 5: Upload to Supabase Storage
      const { data, error } = await uploadClient.storage
        .from(this.bucketName)
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('❌ Error uploading to Supabase:', error);
        console.error('❌ Upload details:', {
          filePath,
          bucketName: this.bucketName,
          bufferSize: imageBuffer.length,
          serviceRoleKey: this.serviceRoleKey.substring(0, 20) + '...'
        });
        throw error;
      }
      
      // Step 6: Get public URL
      const { data: publicUrlData } = uploadClient.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      console.log(`✅ Image uploaded successfully: ${publicUrl}`);
      
      return {
        success: true,
        publicUrl,
        filePath,
        fileName,
        whatsappImageId
      };
      
    } catch (error) {
      console.error('❌ Error uploading WhatsApp image:', error);
      return {
        success: false,
        error: error.message,
        whatsappImageId
      };
    }
  }

  /**
   * Get WhatsApp image download URL using WhatsApp Business API
   * @param {string} imageId - WhatsApp image ID
   * @returns {string|null} Image download URL
   */
  async getWhatsAppImageUrl(imageId) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
      
      if (!accessToken) {
        throw new Error('WhatsApp access token not configured');
      }
      
      // Get image metadata from WhatsApp API
      const response = await axios.get(`https://graph.facebook.com/${apiVersion}/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const imageUrl = response.data.url;
      console.log(`📥 Got WhatsApp image URL for ${imageId}`);
      
      return imageUrl;
    } catch (error) {
      console.error('❌ Error getting WhatsApp image URL:', error);
      return null;
    }
  }

  /**
   * Download image from URL
   * @param {string} imageUrl - Image URL to download
   * @returns {Buffer|null} Image buffer
   */
  async downloadImageFromUrl(imageUrl) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      
      const response = await axios.get(imageUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        responseType: 'arraybuffer'
      });
      
      const imageBuffer = Buffer.from(response.data);
      console.log(`📥 Downloaded image: ${imageBuffer.length} bytes`);
      
      return imageBuffer;
    } catch (error) {
      console.error('❌ Error downloading image:', error);
      return null;
    }
  }

  /**
   * Generate unique filename for the image
   * @param {string} userPhone - User's phone number
   * @param {number} feedbackId - Feedback record ID
   * @param {string} whatsappImageId - WhatsApp image ID
   * @returns {string} Generated filename
   */
  generateFileName(userPhone, feedbackId, whatsappImageId) {
    const timestamp = Date.now();
    const cleanPhone = userPhone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    return `feedback-${feedbackId}-${cleanPhone}-${timestamp}.jpg`;
  }

  /**
   * Delete image from Supabase Storage
   * @param {string} filePath - File path in storage
   * @returns {boolean} Success status
   */
  async deleteImage(filePath) {
    if (!this.supabase) {
      console.warn('⚠️  Supabase not configured, skipping image deletion');
      return false;
    }

    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);
      
      if (error) {
        console.error('❌ Error deleting image:', error);
        return false;
      }
      
      console.log(`🗑️ Image deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      return false;
    }
  }

  /**
   * Get image statistics
   * @returns {object} Storage statistics
   */
  async getStorageStats() {
    if (!this.supabase) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.error('❌ Error getting storage stats:', error);
        return { error: error.message };
      }
      
      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      
      return {
        totalFiles,
        totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        bucketName: this.bucketName
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Test storage connectivity
   * @returns {object} Test result
   */
  async testStorage() {
    if (!this.supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      return {
        success: true,
        bucketExists,
        bucketsCount: buckets.length,
        message: bucketExists ? 'Storage is ready' : 'Bucket needs to be created'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const supabaseStorageService = new SupabaseStorageService();

module.exports = supabaseStorageService;