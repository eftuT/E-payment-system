// ============================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ============================================
require('dotenv').config();

// Debug environment
console.log('========================================');
console.log('🚀 SERVER STARTING...');
console.log('========================================');
console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ MISSING'}`);
console.log(`📡 PORT: ${process.env.PORT || 3000}`);

// Set JWT_SECRET fallback if missing
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET not found in .env, using fallback!');
  process.env.JWT_SECRET = 'fallback_secret_key_for_development_only';
}
console.log('========================================\n');

// ============================================
// IMPORTS
// ============================================
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true
}));

// Body Parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.url.includes('/login')) {
    console.log(`   📝 Login attempt for: ${req.body?.identifier || 'unknown'}`);
  }
  next();
});

// Static Files
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// ============================================
// DATABASE CONNECTION
// ============================================
const db = require('./models/index.js');

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database synchronized successfully.');
  })
  .catch((error) => {
    console.error('❌ Database error:', error);
  });

// ============================================
// ROUTES
// ============================================
const billsRouter = require('./routes/billRoutes.js');
const serviceProvidersRouter = require('./routes/serviceProviderRoute.js');
const paymentRouter = require('./routes/paymentRoutes.js');
const usersRouter = require('./routes/userRoute.js');
const AgentsRouter = require('./routes/agentRoutes.js');
const AdminRouter = require('./routes/AdminRoutes.js');
const adminActivityRouter = require('./routes/adminActivityRoutes.js');

// Mount Routes
app.use('/bills', billsRouter);
app.use('/serviceproviders', serviceProvidersRouter);
app.use('/payment', paymentRouter);
app.use('/Users', usersRouter);
app.use('/agents', AgentsRouter);
app.use('/api/admin', AdminRouter);
app.use('/admin-activity', adminActivityRouter);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to E-Payment System API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwtConfigured: !!process.env.JWT_SECRET,
    database: 'Connected'
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`✅ Server started successfully!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
});

module.exports = app;