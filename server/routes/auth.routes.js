/**
 * ==============================================================================
 * AUTHENTICATION ROUTES (/api/auth)
 * ==============================================================================
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { loginAdmin, verifyToken, COOKIE_NAME, getCookieOptions } = require('../auth');

const router = express.Router();

// Rate limiter for admin login: 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  const result = loginAdmin(email, password);

  if (!result.success) {
    return res.status(401).json(result);
  }

  // Set secure httpOnly cookie
  res.cookie(COOKIE_NAME, result.token, getCookieOptions());

  return res.json({
    success: true,
    message: 'Authentication successful.',
    admin: result.admin,
    token: result.token
  });
});

// GET /api/auth/me - Verify current session
router.get('/me', (req, res) => {
  let token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    admin: { email: decoded.email }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;
