/**
 * ==============================================================================
 * TECHNICAL & ANALYTICAL SKILLS ROUTES (/api/admin/skills)
 * Full CRUD for Skill Categories & Individual Skill Items
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

const router = express.Router();

// Helper to get skills category list from draft
function getDraftSkillCategories() {
  if (!db.data.draft.content.skills) {
    db.data.draft.content.skills = [];
  }
  return db.data.draft.content.skills;
}

// ------------------------------------------------------------------------------
// GET /api/admin/skills - List all skill categories and their items (draft)
// ------------------------------------------------------------------------------
router.get('/skills', requireAdmin, (req, res) => {
  try {
    const list = getDraftSkillCategories();
    res.json({ success: true, skills: list });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch skills.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/skills/category - Add new skill category
// ------------------------------------------------------------------------------
router.post('/skills/category', requireAdmin, (req, res) => {
  try {
    const { category, icon, accent } = req.body;
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const categories = getDraftSkillCategories();
    const newCategory = {
      id: 'skill-cat-' + Date.now(),
      category: category.trim(),
      icon: icon ? icon.trim() : 'fa-brain',
      accent: accent ? accent.trim() : 'cyan',
      items: []
    };

    categories.push(newCategory);
    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.status(201).json({
      success: true,
      message: 'Skill category added successfully.',
      category: newCategory
    });
  } catch (err) {
    console.error('Error creating skill category:', err);
    res.status(500).json({ success: false, error: 'Failed to create skill category.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/skills/category/:categoryId - Edit existing skill category
// ------------------------------------------------------------------------------
router.put('/skills/category/:categoryId', requireAdmin, (req, res) => {
  try {
    const categories = getDraftSkillCategories();
    const cat = categories.find(c => c.id === req.params.categoryId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Skill category not found.' });
    }

    const { category, icon, accent } = req.body;
    if (category !== undefined) {
      if (category.trim() === '') {
        return res.status(400).json({ success: false, error: 'Category name cannot be empty.' });
      }
      cat.category = category.trim();
    }
    if (icon !== undefined) cat.icon = icon.trim();
    if (accent !== undefined) cat.accent = accent.trim();

    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Skill category updated successfully.',
      category: cat
    });
  } catch (err) {
    console.error('Error updating skill category:', err);
    res.status(500).json({ success: false, error: 'Failed to update skill category.' });
  }
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/skills/category/:categoryId - Delete skill category
// ------------------------------------------------------------------------------
router.delete('/skills/category/:categoryId', requireAdmin, (req, res) => {
  try {
    const categories = getDraftSkillCategories();
    const initialLen = categories.length;
    db.data.draft.content.skills = categories.filter(c => c.id !== req.params.categoryId);

    if (db.data.draft.content.skills.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Skill category not found.' });
    }

    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({ success: true, message: 'Skill category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting skill category:', err);
    res.status(500).json({ success: false, error: 'Failed to delete skill category.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/skills/category/:categoryId/item - Add skill to category
// ------------------------------------------------------------------------------
router.post('/skills/category/:categoryId/item', requireAdmin, (req, res) => {
  try {
    const categories = getDraftSkillCategories();
    const cat = categories.find(c => c.id === req.params.categoryId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Skill category not found.' });
    }

    const { name, level, icon } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Skill name is required.' });
    }

    if (!Array.isArray(cat.items)) {
      cat.items = [];
    }

    const newItem = {
      id: 's-' + Date.now(),
      name: name.trim(),
      level: level ? level.trim() : 'Proficient',
      icon: icon ? icon.trim() : 'fa-solid fa-code'
    };

    cat.items.push(newItem);
    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.status(201).json({
      success: true,
      message: 'Skill added to category.',
      item: newItem,
      category: cat
    });
  } catch (err) {
    console.error('Error adding skill item:', err);
    res.status(500).json({ success: false, error: 'Failed to add skill item.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/skills/category/:categoryId/item/:itemId - Edit skill item
// ------------------------------------------------------------------------------
router.put('/skills/category/:categoryId/item/:itemId', requireAdmin, (req, res) => {
  try {
    const categories = getDraftSkillCategories();
    const cat = categories.find(c => c.id === req.params.categoryId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Skill category not found.' });
    }

    const item = (cat.items || []).find(i => i.id === req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Skill item not found.' });
    }

    const { name, level, icon } = req.body;
    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Skill name cannot be empty.' });
      }
      item.name = name.trim();
    }
    if (level !== undefined) item.level = level.trim();
    if (icon !== undefined) item.icon = icon.trim();

    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Skill updated successfully.',
      item,
      category: cat
    });
  } catch (err) {
    console.error('Error updating skill item:', err);
    res.status(500).json({ success: false, error: 'Failed to update skill item.' });
  }
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/skills/category/:categoryId/item/:itemId - Delete skill item
// ------------------------------------------------------------------------------
router.delete('/skills/category/:categoryId/item/:itemId', requireAdmin, (req, res) => {
  try {
    const categories = getDraftSkillCategories();
    const cat = categories.find(c => c.id === req.params.categoryId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Skill category not found.' });
    }

    const initialLen = (cat.items || []).length;
    cat.items = (cat.items || []).filter(i => i.id !== req.params.itemId);

    if (cat.items.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Skill item not found.' });
    }

    db.data.hasUnpublishedChanges = true;
    db.data.lastUpdated = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Skill deleted successfully.',
      category: cat
    });
  } catch (err) {
    console.error('Error deleting skill item:', err);
    res.status(500).json({ success: false, error: 'Failed to delete skill item.' });
  }
});

module.exports = router;
