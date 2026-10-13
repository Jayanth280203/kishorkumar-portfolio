/**
 * ==============================================================================
 * PROJECTS ROUTES (/api/admin/projects)
 * ==============================================================================
 */

const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../auth');

const router = express.Router();

// Helper to validate URLs (allows empty string or valid http/https URLs)
function isValidUrl(string) {
  if (!string || string.trim() === '') return true;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// ------------------------------------------------------------------------------
// GET /api/admin/projects - List all projects (including drafts)
// ------------------------------------------------------------------------------
router.get('/projects', requireAdmin, (req, res) => {
  try {
    const projects = db.getProjects(true);
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch projects.' });
  }
});

// ------------------------------------------------------------------------------
// GET /api/admin/projects/:id - Get project by ID
// ------------------------------------------------------------------------------
router.get('/projects/:id', requireAdmin, (req, res) => {
  try {
    const project = db.getProjectById(req.params.id, true);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch project.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/projects - Create new project
// ------------------------------------------------------------------------------
router.post('/projects', requireAdmin, (req, res) => {
  try {
    const data = req.body;

    if (!data.title || data.title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Project title is required.' });
    }

    // URL validations
    if (!isValidUrl(data.githubUrl)) {
      return res.status(400).json({ success: false, error: 'GitHub URL must be a valid http or https URL.' });
    }
    if (!isValidUrl(data.liveUrl)) {
      return res.status(400).json({ success: false, error: 'Live Demo URL must be a valid http or https URL.' });
    }
    if (!isValidUrl(data.dashboardUrl)) {
      return res.status(400).json({ success: false, error: 'Dashboard URL must be a valid http or https URL.' });
    }

    const newProject = {
      id: 'proj-' + Date.now(),
      title: data.title.trim(),
      category: data.category || 'Python',
      badge: data.badge || '',
      shortDescription: data.shortDescription || '',
      detailedDescription: data.detailedDescription || '',
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      projectOverview: data.projectOverview || '',
      keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
      keyFindings: data.keyFindings || '',
      businessImpact: data.businessImpact || '',
      githubUrl: data.githubUrl ? data.githubUrl.trim() : '',
      liveUrl: data.liveUrl ? data.liveUrl.trim() : '',
      dashboardUrl: data.dashboardUrl ? data.dashboardUrl.trim() : '',
      thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl.trim() : '',
      featured: Boolean(data.featured),
      displayOrder: Number(data.displayOrder) || (db.data.draft.projects.length + 1),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true
    };

    const saved = db.saveProject(newProject);
    res.status(201).json({
      success: true,
      message: 'Project created successfully in draft.',
      project: saved
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
});

// ------------------------------------------------------------------------------
// PUT /api/admin/projects/:id - Update existing project
// ------------------------------------------------------------------------------
router.put('/projects/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.getProjectById(req.params.id, true);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const data = req.body;

    if (data.title !== undefined && data.title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Project title cannot be empty.' });
    }

    // URL validations
    if (data.githubUrl !== undefined && !isValidUrl(data.githubUrl)) {
      return res.status(400).json({ success: false, error: 'GitHub URL must be a valid http or https URL.' });
    }
    if (data.liveUrl !== undefined && !isValidUrl(data.liveUrl)) {
      return res.status(400).json({ success: false, error: 'Live Demo URL must be a valid http or https URL.' });
    }
    if (data.dashboardUrl !== undefined && !isValidUrl(data.dashboardUrl)) {
      return res.status(400).json({ success: false, error: 'Dashboard URL must be a valid http or https URL.' });
    }

    const updated = {
      ...existing,
      ...data,
      id: req.params.id // Prevent ID modification
    };

    const saved = db.saveProject(updated);
    res.json({
      success: true,
      message: 'Project updated successfully in draft.',
      project: saved
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ success: false, error: 'Failed to update project.' });
  }
});

// ------------------------------------------------------------------------------
// DELETE /api/admin/projects/:id - Delete project
// ------------------------------------------------------------------------------
router.delete('/projects/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete project.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/projects/:id/duplicate - Duplicate project
// ------------------------------------------------------------------------------
router.post('/projects/:id/duplicate', requireAdmin, (req, res) => {
  try {
    const duplicate = db.duplicateProject(req.params.id);
    if (!duplicate) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    res.json({
      success: true,
      message: 'Project duplicated successfully.',
      project: duplicate
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to duplicate project.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/projects/reorder - Reorder projects
// ------------------------------------------------------------------------------
router.post('/projects/reorder', requireAdmin, (req, res) => {
  try {
    const { order } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, error: 'Invalid order array.' });
    }

    db.reorderProjects(order);
    res.json({ success: true, message: 'Projects reordered successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reorder projects.' });
  }
});

// ------------------------------------------------------------------------------
// POST /api/admin/projects/:id/toggle-publish - Toggle publish/draft status
// ------------------------------------------------------------------------------
router.post('/projects/:id/toggle-publish', requireAdmin, (req, res) => {
  try {
    const project = db.getProjectById(req.params.id, true);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    project.isPublished = !project.isPublished;
    db.saveProject(project);

    res.json({
      success: true,
      message: `Project ${project.isPublished ? 'published' : 'moved to drafts'}.`,
      isPublished: project.isPublished
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle project status.' });
  }
});

module.exports = router;
