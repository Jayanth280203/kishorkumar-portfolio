/**
 * ==============================================================================
 * KISHOR KUMAR - DATA ANALYST PORTFOLIO & CMS SERVER
 * Production-ready Express Backend with Secure Authentication & Persistent CMS
 * ==============================================================================
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Internal modules
const db = require('./server/database');
const { requireAdmin } = require('./server/auth');

// Route modules
const authRoutes = require('./server/routes/auth.routes');
const contentRoutes = require('./server/routes/content.routes');
const projectsRoutes = require('./server/routes/projects.routes');
const experienceRoutes = require('./server/routes/experience.routes');
const skillsRoutes = require('./server/routes/skills.routes');
const resumeRoutes = require('./server/routes/resume.routes');
const mediaRoutes = require('./server/routes/media.routes');
const socialRoutes = require('./server/routes/social.routes');
const enquiryRoutes = require('./server/routes/enquiry.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable fingerprinting header
app.disable('x-powered-by');

// ------------------------------------------------------------------------------
// Core Middleware
// ------------------------------------------------------------------------------
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Secure CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, and same-origin requests without Origin header
    if (!origin) return callback(null, true);

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (process.env.NODE_ENV !== 'production' && isLocalhost) {
      return callback(null, true);
    }

    if (allowedOrigins && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Default to same-host origin in production if no explicit origin whitelist configured
    if (!allowedOrigins && isLocalhost) {
      return callback(null, true);
    }

    callback(null, false);
  },
  credentials: true
}));

// Comprehensive Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; connect-src 'self' https://accounts.google.com https://apis.google.com; frame-src 'self' https://accounts.google.com;"
  );
  next();
});

// ------------------------------------------------------------------------------
// Static Asset Serving
// ------------------------------------------------------------------------------
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// ------------------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/admin', projectsRoutes);
app.use('/api/admin', experienceRoutes);
app.use('/api/admin', skillsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', resumeRoutes);
app.use('/api/admin', mediaRoutes);
app.use('/api/admin', socialRoutes);
app.use('/api', enquiryRoutes);
app.use('/api/admin', enquiryRoutes);

// Protected endpoint to retrieve Google Drive OAuth config for Google Picker
app.get('/api/admin/gdrive-config', requireAdmin, (req, res) => {
  res.json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    apiKey: process.env.GOOGLE_API_KEY || '',
    appId: process.env.GOOGLE_APP_ID || '',
    isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_API_KEY)
  });
});

// ------------------------------------------------------------------------------
// Page Routes
// ------------------------------------------------------------------------------
// Helper to resolve static HTML files safely across standalone and serverless environments
function sendHtmlSafely(res, filename) {
  const candidates = [
    path.join(__dirname, filename),
    path.join(__dirname, '..', filename),
    path.join(process.cwd(), filename)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }
  return res.status(404).send(`${filename} not found.`);
}

// Public Homepage
app.get('/', (req, res) => {
  sendHtmlSafely(res, 'index.html');
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  sendHtmlSafely(res, 'admin.html');
});

// Direct admin.html access
app.get('/admin.html', (req, res) => {
  sendHtmlSafely(res, 'admin.html');
});

// ------------------------------------------------------------------------------
// Error Handling Middleware
// ------------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// ------------------------------------------------------------------------------
// Start Server (Standalone mode only; skipped when imported by serverless handlers or test suites)
// ------------------------------------------------------------------------------
let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`==========================================================`);
    console.log(` Kishor Kumar Data Analyst Portfolio & Admin CMS Server`);
    console.log(` Public Website : http://localhost:${PORT}`);
    console.log(` Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(` Admin Identity : ${process.env.ADMIN_EMAIL || 'admin@kishorkumar.dev'}`);
    console.log(`==========================================================`);
  });
}

module.exports = { app, server };
