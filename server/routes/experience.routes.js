/**
 * ==============================================================================
 * WORK EXPERIENCE ROUTES (/api/admin/experience)
 * Full CRUD for professional career history & achievement bullet points
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

const router = express.Router();

// Helper to get experience list from draft
function getDraftExperiences() {
  if (!db.data.draft.content.experience) {
    db.data.draft.content.experience = [];
  }
  return db.data.draft.content.experience;
}

// ------------------------------------------------------------------------------
// GET /api/admin/experience - List all experience records (draft)
// ------------------------------------------------------------------------------
router.get('/experience', requireAdmin, (req, res) => {
  try {
    const list = getDraftExperiences();
    res.json({ success: true, experience: list });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch experience records.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/experience - Create new experience record
// ------------------------------------------------------------------------------
router.post('/experience', requireAdmin, (req, res) => {
  try {
    const { jobTitle, company, location, startDate, endDate, isCurrent, description, achievements, displayOrder } = req.body;

    if (!jobTitle || jobTitle.trim() === '') {
      return res.status(400).json({ success: false, error: 'Job title is required.' });
    }
    if (!company || company.trim() === '') {
      return res.status(400).json({ success: false, error: 'Company name is required.' });
    }

    const list = getDraftExperiences();
    const newEntry = {
      id: 'exp-' + Date.now(),
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      location: location ? location.trim() : 'Remote',
      startDate: startDate ? startDate.trim() : '',
      endDate: isCurrent ? 'Present' : (endDate ? endDate.trim() : ''),
      isCurrent: Boolean(isCurrent),
      description: description ? description.trim() : '',
      achievements: Array.isArray(achievements) ? achievements.map(a => typeof a === 'object' ? a.text : a).filter(Boolean) : [],
      displayOrder: Number(displayOrder) || (list.length + 1),
      updatedAt: new Date().toISOString()
    };

    list.push(newEntry);
    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.status(201).json({
      success: true,
      message: 'Work experience added to draft.',
      experience: newEntry
    });
  } catch (err) {
    console.error('Error creating experience:', err);
    res.status(500).json({ success: false, error: 'Failed to create experience record.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/experience/:id - Update existing experience record
// ------------------------------------------------------------------------------
router.put('/experience/:id', requireAdmin, (req, res) => {
  try {
    const list = getDraftExperiences();
    const index = list.findIndex(e => e.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Experience record not found.' });
    }

    const { jobTitle, company, location, startDate, endDate, isCurrent, description, achievements, displayOrder } = req.body;

    if (jobTitle !== undefined && jobTitle.trim() === '') {
      return res.status(400).json({ success: false, error: 'Job title cannot be empty.' });
    }
    if (company !== undefined && company.trim() === '') {
      return res.status(400).json({ success: false, error: 'Company name cannot be empty.' });
    }

    const existing = list[index];
    const updated = {
      ...existing,
      jobTitle: jobTitle !== undefined ? jobTitle.trim() : existing.jobTitle,
      company: company !== undefined ? company.trim() : existing.company,
      location: location !== undefined ? location.trim() : existing.location,
      startDate: startDate !== undefined ? startDate.trim() : existing.startDate,
      endDate: isCurrent ? 'Present' : (endDate !== undefined ? endDate.trim() : existing.endDate),
      isCurrent: isCurrent !== undefined ? Boolean(isCurrent) : existing.isCurrent,
      description: description !== undefined ? description.trim() : existing.description,
      achievements: Array.isArray(achievements) ? achievements.map(a => typeof a === 'object' ? a.text : a).filter(Boolean) : existing.achievements,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Work experience updated successfully.',
      experience: updated
    });
  } catch (err) {
    console.error('Error updating experience:', err);
    res.status(500).json({ success: false, error: 'Failed to update experience record.' });
  }
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/experience/:id - Delete experience record
// ------------------------------------------------------------------------------
router.delete('/experience/:id', requireAdmin, (req, res) => {
  try {
    const list = getDraftExperiences();
    const initialLen = list.length;
    db.data.draft.content.experience = list.filter(e => e.id !== req.params.id);

    if (db.data.draft.content.experience.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Experience record not found.' });
    }

    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({ success: true, message: 'Experience record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete experience record.' });
  }
});

module.exports = router;
