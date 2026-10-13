/**
 * ==============================================================================
 * KISHOR KUMAR - DATA ANALYST PORTFOLIO & CMS SERVER
 * Production-ready Express Backend with Secure Authentication & Persistent CMS
 * ==============================================================================
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
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

// ------------------------------------------------------------------------------
// Core Middleware
// ------------------------------------------------------------------------------
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
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
// Public Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Direct admin.html access
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
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
// Start Server
// ------------------------------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`==========================================================`);
  console.log(` Kishor Kumar Data Analyst Portfolio & Admin CMS Server`);
  console.log(` Public Website : http://localhost:${PORT}`);
  console.log(` Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(` Admin Identity : ${process.env.ADMIN_EMAIL || 'admin@kishorkumar.dev'}`);
  console.log(`==========================================================`);
});

module.exports = { app, server };
