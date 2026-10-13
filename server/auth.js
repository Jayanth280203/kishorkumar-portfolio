/**
 * ==============================================================================
 * KISHOR KUMAR PORTFOLIO - SERVER-SIDE AUTHENTICATION SERVICE
 * Secure JWT-based sessions, bcrypt password hashing, and cookie protection
 * ==============================================================================
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const AUTH_SECRET = process.env.AUTH_SECRET || 'kk_portfolio_auth_secret_token_change_in_production_2026_xyz';
const COOKIE_NAME = 'kk_admin_token';

// ------------------------------------------------------------------------------
// Login Administrator
// ------------------------------------------------------------------------------
function loginAdmin(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const adminRecord = db.data.admin;

  if (!adminRecord || adminRecord.email.toLowerCase() !== normalizedEmail) {
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  const isPasswordValid = bcrypt.compareSync(password, adminRecord.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  // Generate secure JWT token
  const token = jwt.sign(
    {
      email: adminRecord.email,
      role: 'admin',
      iss: 'kk-portfolio-auth'
    },
    AUTH_SECRET,
    { expiresIn: '24h' }
  );

  return {
    success: true,
    token,
    admin: { email: adminRecord.email }
  };
}

// ------------------------------------------------------------------------------
// Cookie Configuration Helper
// ------------------------------------------------------------------------------
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
}

// ------------------------------------------------------------------------------
// Verify Admin Token
// ------------------------------------------------------------------------------
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    if (decoded && decoded.role === 'admin' && decoded.email.toLowerCase() === db.data.admin.email.toLowerCase()) {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// ------------------------------------------------------------------------------
// Admin Authorization Middleware
// ------------------------------------------------------------------------------
function requireAdmin(req, res, next) {
  let token = null;

  // 1. Check httpOnly Cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  // 2. Fallback to Authorization Header (Bearer <token>)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Admin session required.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    // Clear invalid cookie
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please log in again.'
    });
  }

  req.adminUser = decoded;
  next();
}

module.exports = {
  loginAdmin,
  verifyToken,
  requireAdmin,
  COOKIE_NAME,
  getCookieOptions
};
