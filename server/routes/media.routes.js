/**
 * ==============================================================================
 * MEDIA ROUTES (/api/admin/media)
 * ==============================================================================
 */

const express = require('express');
const path = require('path');
const db = require('../database');
const { requireAdmin } = require('../auth');
const { imageUpload } = require('../upload');

const router = express.Router();

// ------------------------------------------------------------------------------
// GET /api/admin/media - List all uploaded media files
// ------------------------------------------------------------------------------
router.get('/media', requireAdmin, (req, res) => {
  try {
    const media = db.getMedia();
    res.json({ success: true, media });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch media list.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/media/upload - Upload Image (JPG, PNG, WebP)
// ------------------------------------------------------------------------------
router.post('/media/upload', requireAdmin, (req, res) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const relativePath = path.join('uploads', 'images', req.file.filename).replace(/\\/g, '/');
    const publicUrl = `/${relativePath}`;

    const uploadType = req.body.type || req.query.type || 'general';
    const mediaItem = {
      id: 'med-' + Date.now(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: relativePath,
      url: publicUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      type: uploadType, // 'profile', 'project', 'dashboard', 'general'
      uploadDate: new Date().toISOString()
    };

    const saved = db.addMedia(mediaItem);

    // If marked as profile photo, update profile photo in draft directly
    if (uploadType === 'profile') {
      if (db.data.draft && db.data.draft.content && db.data.draft.content.profile) {
        db.data.draft.content.profile.photo = publicUrl;
        if (db.data.draft.content.hero) {
          db.data.draft.content.hero.photo = publicUrl;
        }
        db.data.hasUnpublishedChanges = true;
        db.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      media: saved,
      file: saved,
      url: publicUrl
    });
  });
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/media/:id - Delete media file
// ------------------------------------------------------------------------------
router.delete('/media/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteMedia(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Media file not found.' });
    }
    res.json({ success: true, message: 'Media file deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete media.' });
  }
});

module.exports = router;
