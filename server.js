const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const webhookRoutes = require('./routes/webhook');
const whatsappRoutes = require('./routes/whatsapp');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Security middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5175',
    // Allow all localhost ports for development
    /^http:\/\/localhost:\d+$/,
    // Allow Railway/Vercel/Netlify deployments
    /^https:\/\/.*\.railway\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.netlify\.app$/,
    // Allow all origins in development (remove in production)
    process.env.NODE_ENV === 'development' ? '*' : null
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

// CORS Proxy endpoint for WhatsApp flow downloads
app.get('/api/proxy/flow-json', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing url parameter'
      });
    }

    console.log('📥 Proxying flow JSON request:', url);

    // Fetch the JSON from WhatsApp's download URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch from download URL:', response.status);
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch: ${response.statusText}`
      });
    }

    const jsonData = await response.json();
    console.log('✅ Flow JSON fetched successfully via proxy');

    res.json({
      success: true,
      data: jsonData
    });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to proxy request'
    });
  }
});

// API routes
app.use('/webhook', webhookRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/feedback', feedbackRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Feedback Collection Server is running!',
    version: require('./package.json').version,
    endpoints: {
      webhook: '/webhook',
      whatsapp: '/api/whatsapp',
      feedback: '/api/feedback',
      health: '/health'
    },
    description: 'WhatsApp Business API backend for collecting user feedback through conversation flow'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 WhatsApp Webhook Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Webhook URL: http://${HOST}:${PORT}/webhook`);
  console.log(`🌐 Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test that the server is actually working
  console.log('✅ Server is ready to accept requests');
});

module.exports = app;