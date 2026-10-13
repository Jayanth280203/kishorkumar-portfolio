/**
 * ==============================================================================
 * SOCIAL & PROFESSIONAL PROFILES ROUTES (/api/admin/social)
 * Full dynamic CRUD, ordering, and visibility toggle for professional links
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

const router = express.Router();

// ------------------------------------------------------------------------------
// GET /api/admin/social - List all social profiles (draft)
// ------------------------------------------------------------------------------
router.get('/social', requireAdmin, (req, res) => {
  try {
    const profiles = db.getSocialProfiles(true);
    res.json({ success: true, profiles });
  } catch (err) {
    console.error('Error fetching social profiles:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve social profiles.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/social - Create a new social profile
// ------------------------------------------------------------------------------
router.post('/social', requireAdmin, (req, res) => {
  try {
    const { platform, url, icon, accent, description, buttonLabel, displayOrder, isEnabled } = req.body;

    if (!platform || platform.trim() === '') {
      return res.status(400).json({ success: false, error: 'Platform name is required.' });
    }

    if (!url || url.trim() === '') {
      return res.status(400).json({ success: false, error: 'Valid URL is required.' });
    }

    const newProfile = {
      id: 'soc-' + Date.now(),
      platform: platform.trim(),
      url: url.trim(),
      icon: (icon || 'fa-solid fa-link').trim(),
      accent: (accent || '#06b6d4').trim(),
      description: (description || '').trim(),
      buttonLabel: (buttonLabel || `View ${platform.trim()} Profile`).trim(),
      displayOrder: typeof displayOrder === 'number' ? displayOrder : (db.getSocialProfiles(true).length + 1),
      isEnabled: isEnabled !== false
    };

    const saved = db.saveSocialProfile(newProfile);
    res.status(201).json({
      success: true,
      message: `${platform} profile added successfully.`,
      profile: saved,
      hasUnpublishedChanges: true
    });
  } catch (err) {
    console.error('Error creating social profile:', err);
    res.status(500).json({ success: false, error: 'Failed to create social profile.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/social/reorder - Reorder profiles
// ------------------------------------------------------------------------------
router.put('/social/reorder', requireAdmin, (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, error: 'Order array is required.' });
    }

    db.reorderSocialProfiles(order);
    res.json({
      success: true,
      message: 'Social profiles order updated.',
      profiles: db.getSocialProfiles(true),
      hasUnpublishedChanges: true
    });
  } catch (err) {
    console.error('Error reordering social profiles:', err);
    res.status(500).json({ success: false, error: 'Failed to reorder social profiles.' });
  }
});

// ------------------------------------------------------------------------------
// PATCH /api/admin/social/:id/toggle - Toggle enabled/disabled status
// ------------------------------------------------------------------------------
router.patch('/social/:id/toggle', requireAdmin, (req, res) => {
  try {
    const toggled = db.toggleSocialProfile(req.params.id);
    if (!toggled) {
      return res.status(404).json({ success: false, error: 'Social profile not found.' });
    }

    res.json({
      success: true,
      message: `${toggled.platform} profile visibility toggled.`,
      profile: toggled,
      hasUnpublishedChanges: true
    });
  } catch (err) {
    console.error('Error toggling social profile:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle social profile.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/social/:id - Update an existing social profile
// ------------------------------------------------------------------------------
router.put('/social/:id', requireAdmin, (req, res) => {
  try {
    const { platform, url, icon, accent, description, buttonLabel, displayOrder, isEnabled } = req.body;

    if (!platform || platform.trim() === '') {
      return res.status(400).json({ success: false, error: 'Platform name is required.' });
    }

    if (!url || url.trim() === '') {
      return res.status(400).json({ success: false, error: 'Valid URL is required.' });
    }

    const updatedProfile = {
      id: req.params.id,
      platform: platform.trim(),
      url: url.trim(),
      icon: (icon || 'fa-solid fa-link').trim(),
      accent: (accent || '#06b6d4').trim(),
      description: (description || '').trim(),
      buttonLabel: (buttonLabel || `View ${platform.trim()} Profile`).trim(),
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 1,
      isEnabled: isEnabled !== false
    };

    const saved = db.saveSocialProfile(updatedProfile);
    res.json({
      success: true,
      message: `${platform} profile updated successfully.`,
      profile: saved,
      hasUnpublishedChanges: true
    });
  } catch (err) {
    console.error('Error updating social profile:', err);
    res.status(500).json({ success: false, error: 'Failed to update social profile.' });
  }
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/social/:id - Delete a social profile
// ------------------------------------------------------------------------------
router.delete('/social/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteSocialProfile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Social profile not found.' });
    }

    res.json({
      success: true,
      message: 'Social profile deleted successfully.',
      hasUnpublishedChanges: true
    });
  } catch (err) {
    console.error('Error deleting social profile:', err);
    res.status(500).json({ success: false, error: 'Failed to delete social profile.' });
  }
});

module.exports = router;
