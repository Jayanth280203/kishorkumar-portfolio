/**
 * ==============================================================================
 * CONTENT ROUTES (/api/public/content & /api/admin/content)
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

const router = express.Router();

// ------------------------------------------------------------------------------
// PUBLIC: GET /api/public/content (Accessible by all visitors without login)
// ------------------------------------------------------------------------------
router.get('/public/content', (req, res) => {
  try {
    const publicData = db.getPublicContent();
    res.json({
      success: true,
      data: publicData
    });
  } catch (err) {
    console.error('Error fetching public content:', err);
    res.status(500).json({ success: false, error: 'Could not fetch portfolio content.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: GET /api/admin/content (Protected)
// ------------------------------------------------------------------------------
router.get('/admin/content', requireAdmin, (req, res) => {
  try {
    const adminData = db.getAdminData();
    res.json({
      success: true,
      data: adminData
    });
  } catch (err) {
    console.error('Error fetching admin content:', err);
    res.status(500).json({ success: false, error: 'Could not fetch admin content.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: PUT /api/admin/content (Protected) - Update Draft Content
// ------------------------------------------------------------------------------
router.put('/admin/content', requireAdmin, (req, res) => {
  try {
    const { section, data } = req.body;

    if (section && data) {
      db.updateDraftSection(section, data);
    } else if (req.body.content) {
      db.updateFullDraftContent(req.body.content);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payload. Section or content expected.' });
    }

    res.json({
      success: true,
      message: 'Draft content saved successfully.',
      hasUnpublishedChanges: true,
      lastUpdated: db.data.lastUpdated
    });
  } catch (err) {
    console.error('Error updating draft content:', err);
    res.status(500).json({ success: false, error: 'Failed to update draft content.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: POST /api/admin/publish (Protected) - Promote Drafts to Live Public
// ------------------------------------------------------------------------------
router.post('/admin/publish', requireAdmin, (req, res) => {
  try {
    const published = db.publishAll();
    if (published) {
      res.json({
        success: true,
        message: 'All changes published live successfully!',
        lastPublished: db.data.lastPublished
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save published snapshot.' });
    }
  } catch (err) {
    console.error('Error publishing content:', err);
    res.status(500).json({ success: false, error: 'Could not publish content.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: POST /api/admin/reset-draft (Protected) - Discard Drafts
// ------------------------------------------------------------------------------
router.post('/admin/reset-draft', requireAdmin, (req, res) => {
  try {
    db.data.draft = JSON.parse(JSON.stringify(db.data.published));
    db.data.hasUnpublishedChanges = false;
    db.save();

    res.json({
      success: true,
      message: 'Draft changes reverted to published state.',
      draft: db.data.draft
    });
  } catch (err) {
    console.error('Error reverting draft:', err);
    res.status(500).json({ success: false, error: 'Failed to revert draft.' });
  }
});

module.exports = router;
