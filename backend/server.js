const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');

// ===== NEW FEATURE ROUTES =====
const validationRoutes = require('./routes/validation');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');
const comparisonRoutes = require('./routes/comparison');
const alertsRoutes = require('./routes/alerts');
const exportRoutes = require('./routes/export');
const correctionsRoutes = require('./routes/corrections');
const schedulerRoutes = require('./routes/scheduler');
const cloudRoutes = require('./routes/cloud');

const app = express();
const PORT = process.env.PORT || 5000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// ===== MIDDLEWARE =====

// Security
app.use(helmet());

// CORS - More permissive in development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'http://localhost:3002'];

console.log('========================================');
console.log('CORS Configuration:');
console.log(`  Environment: ${isDevelopment ? 'development' : 'production'}`);
console.log(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`  Development Mode: ${isDevelopment ? 'ALL ORIGINS ALLOWED' : 'RESTRICTED'}`);
console.log('========================================');

app.use(cors({
  origin: (origin, callback) => {
    console.log(`[CORS] Request from origin: ${origin || 'NO ORIGIN (same-origin or tool)'}`);

    // In development, allow all origins or those in the allowed list
    if (isDevelopment) {
      console.log(`[CORS] ✅ ALLOWED (development mode)`);
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ ALLOWED`);
      callback(null, true);
    } else {
      console.warn(`[CORS] ❌ BLOCKED - Origin not in allowed list`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute (reduced from 15)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 1000 : 100), // Higher limit in dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development for localhost
    if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Serve static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log('');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`  Origin: ${req.headers.origin || 'None'}`);
  console.log(`  User-Agent: ${req.headers['user-agent'] || 'None'}`);
  console.log(`  IP: ${req.ip}`);
  next();
});

// ===== ROUTES =====

// Existing routes
app.use('/api', routes);

// ===== NEW FEATURE ROUTES =====
app.use('/api/validation', validationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/corrections', correctionsRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/cloud', cloudRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PDF to Excel Converter API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: 'POST /api/upload',
      batches: 'GET /api/batches',
      batchStatus: 'GET /api/batches/:batchId/status',
      downloadExcel: 'GET /api/batches/:batchId/download'
    }
  });
});

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('');
  console.error('========================================');
  console.error('[ERROR] Server Error Occurred');
  console.error('========================================');
  console.error(`[ERROR] Request: ${req.method} ${req.url}`);
  console.error(`[ERROR] Origin: ${req.headers.origin || 'None'}`);
  console.error(`[ERROR] Error Message: ${err.message}`);
  console.error(`[ERROR] Error Name: ${err.name}`);
  console.error(`[ERROR] Status Code: ${err.statusCode || 500}`);
  console.error('========================================');
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR] Stack Trace:');
    console.error(err.stack);
    console.error('========================================');
  }
  console.error('');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====

const startServer = async () => {
  try {
    console.log('');
    console.log('========================================');
    console.log('  Starting PDF to Excel Converter API');
    console.log('========================================');
    console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Startup] Port: ${PORT}`);
    console.log(`[Startup] Database: ${process.env.DB_NAME}`);
    console.log(`[Startup] Database Host: ${process.env.DB_HOST}`);
    console.log('========================================');
    console.log('');

    // Test database connection
    console.log('[Startup] Testing database connection...');
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
      console.error('[Startup] ❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    console.log('[Startup] ✅ Database connected successfully');

    // Create upload directories
    console.log('[Startup] Creating upload directories...');
    const fs = require('fs').promises;
    const uploadDirs = ['uploads/pdfs', 'uploads/exports'];

    for (const dir of uploadDirs) {
      await fs.mkdir(path.join(__dirname, '../', dir), { recursive: true });
      console.log(`[Startup] ✅ Created directory: ${dir}`);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('  PDF to Excel Converter API - READY');
      console.log('========================================');
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Database: ${process.env.DB_NAME}`);
      console.log(`  Frontend URL: http://localhost:5173`);
      console.log('========================================');
      console.log('  Server is ready to accept requests!');
      console.log('========================================');
      console.log('');
    });

  } catch (error) {
    console.error('[Startup] ❌ Failed to start server:', error);
    console.error('[Startup] Error details:', error.message);
    console.error('[Startup] Stack trace:', error.stack);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
