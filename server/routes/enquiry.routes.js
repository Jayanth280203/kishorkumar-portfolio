/**
 * ==============================================================================
 * CONTACT ENQUIRIES & MESSAGES ROUTES
 * Public Submission: POST /api/contact
 * Admin Inbox: /api/admin/enquiries, status updates, deletion, stats
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (_) {
  // Graceful fallback if nodemailer is not present
}

const router = express.Router();

// Memory store for basic duplicate prevention (same email+message within 60s)
const recentSubmissions = new Map();

// Helper to sanitize text
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

// ------------------------------------------------------------------------------
// PUBLIC: POST /api/contact - Submit Contact Enquiry
// ------------------------------------------------------------------------------
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, company_website_hp } = req.body || {};

    // 1. Honeypot check - if bot filled hidden field, return silent success
    if (company_website_hp && String(company_website_hp).trim() !== '') {
      console.warn('[HONEYPOT TRIGGERED] Bot submission blocked silently.');
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your message has been received.'
      });
    }

    // 2. Validate Name
    const cleanName = sanitize(name);
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name between 2 and 100 characters.'
      });
    }

    // 3. Validate Email
    const cleanEmail = sanitize(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address (e.g. name@company.com).'
      });
    }

    // 4. Validate Subject
    const cleanSubject = sanitize(subject);
    if (!cleanSubject || cleanSubject.length < 2 || cleanSubject.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a subject line between 2 and 200 characters.'
      });
    }

    // 5. Validate Message
    const cleanMessage = sanitize(message);
    if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message must be between 10 and 5,000 characters.'
      });
    }

    // 6. Duplicate Submission Protection
    const duplicateKey = `${cleanEmail}:${cleanMessage.slice(0, 50)}`;
    const now = Date.now();
    if (recentSubmissions.has(duplicateKey)) {
      const prevTime = recentSubmissions.get(duplicateKey);
      if (now - prevTime < 60000) {
        return res.status(429).json({
          success: false,
          error: 'A duplicate message was recently received. Please wait a minute before submitting again.'
        });
      }
    }
    recentSubmissions.set(duplicateKey, now);

    // Clean old entries in duplicate map
    if (recentSubmissions.size > 200) {
      for (const [k, t] of recentSubmissions.entries()) {
        if (now - t > 120000) recentSubmissions.delete(k);
      }
    }

    // 7. Save Enquiry Directly to Persistent Database (Independent of CMS publish)
    const enquiry = db.addEnquiry({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      ip: req.ip || req.connection?.remoteAddress || 'unknown'
    });

    console.log(`[CONTACT ENQUIRY] New enquiry from "${cleanName}" <${cleanEmail}> - Subject: "${cleanSubject}"`);

    // 8. Attempt Email Notification if Configured
    sendEmailNotification(enquiry).catch(err => {
      console.warn('[CONTACT NOTIFICATION] Notification delivery warning (enquiry safely stored in DB):', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Kishor will get back to you shortly.',
      enquiryId: enquiry.id
    });
  } catch (err) {
    console.error('Error processing contact form:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while sending your message. Please try again.'
    });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: GET /api/admin/enquiries - List enquiries with search and filtering
// ------------------------------------------------------------------------------
router.get('/enquiries', requireAdmin, (req, res) => {
  try {
    const { status, search } = req.query;
    const enquiries = db.getEnquiries({ status, search });
    const stats = db.getEnquiryStats();
    res.json({
      success: true,
      enquiries,
      stats
    });
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve enquiries.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: GET /api/admin/enquiries/stats - Enquiry count statistics
// ------------------------------------------------------------------------------
router.get('/enquiries/stats', requireAdmin, (req, res) => {
  try {
    const stats = db.getEnquiryStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching enquiry stats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve enquiry statistics.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: GET /api/admin/enquiries/:id - Get single enquiry detail
// ------------------------------------------------------------------------------
router.get('/enquiries/:id', requireAdmin, (req, res) => {
  try {
    const enquiry = db.getEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }
    res.json({ success: true, enquiry });
  } catch (err) {
    console.error('Error fetching enquiry details:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve enquiry details.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: PUT /api/admin/enquiries/:id/status - Update enquiry status
// ------------------------------------------------------------------------------
router.put('/enquiries/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Expected "unread", "read", or "archived".'
      });
    }

    const updated = db.updateEnquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: `Enquiry status changed to "${status}".`,
      enquiry: updated,
      stats: db.getEnquiryStats()
    });
  } catch (err) {
    console.error('Error updating enquiry status:', err);
    res.status(500).json({ success: false, error: 'Failed to update enquiry status.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: DELETE /api/admin/enquiries/:id - Delete enquiry permanently
// ------------------------------------------------------------------------------
router.delete('/enquiries/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteEnquiry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully.',
      stats: db.getEnquiryStats()
    });
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to delete enquiry.' });
  }
});

// ------------------------------------------------------------------------------
// Helper: Optional Email Notification
// ------------------------------------------------------------------------------
async function sendEmailNotification(enquiry) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'kishorsk1702@gmail.com';

  if (!nodemailer || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // SMTP not configured - gracefully logged to console
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    replyTo: enquiry.email,
    subject: `[Portfolio Enquiry] ${enquiry.subject} - from ${enquiry.name}`,
    text: `New contact enquiry received on Kishor Kumar Portfolio CMS:\n\nSender: ${enquiry.name} <${enquiry.email}>\nSubject: ${enquiry.subject}\nDate: ${new Date(enquiry.createdAt).toLocaleString()}\n\nMessage:\n${enquiry.message}\n\nManage enquiries in your admin dashboard: /admin`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #070d1a; color: #f1f5f9; padding: 24px; border-radius: 8px;">
        <h2 style="color: #06b6d4; margin-top: 0;">New Contact Enquiry</h2>
        <p><strong>From:</strong> ${enquiry.name} (<a href="mailto:${enquiry.email}" style="color:#38bdf8;">${enquiry.email}</a>)</p>
        <p><strong>Subject:</strong> ${enquiry.subject}</p>
        <p><strong>Received:</strong> ${new Date(enquiry.createdAt).toLocaleString()}</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 16px 0;" />
        <div style="background: #0f172a; padding: 16px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">${enquiry.message}</div>
        <p style="margin-top: 20px;">
          <a href="mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(enquiry.subject)}" style="background: #06b6d4; color: #040914; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply via Email</a>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
