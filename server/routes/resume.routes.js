/**
 * ==============================================================================
 * RESUME ROUTES (/api/admin/resume & /api/resume)
 * ==============================================================================
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const db = require('../database');
const { requireAdmin } = require('../auth');
const { resumeUpload, RESUMES_DIR } = require('../upload');

const router = express.Router();

// ------------------------------------------------------------------------------
// PUBLIC: GET /api/resume/download - Download Active Resume
// ------------------------------------------------------------------------------
router.get('/download', (req, res) => {
  try {
    const active = db.getActiveResume();
    if (!active) {
      return res.status(404).send('No active resume is currently published.');
    }

    const filePath = path.join(__dirname, '..', '..', active.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Resume file not found on server.');
    }

    const downloadName = active.originalName || active.filename || 'Kishor_Kumar_Data_Analyst_Resume.pdf';
    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Error sending resume file:', err);
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).send('Internal server error during download.');
  }
});

// ------------------------------------------------------------------------------
// PUBLIC: GET /api/resume/preview - View / Stream Active Resume Inline
// ------------------------------------------------------------------------------
router.get('/preview', (req, res) => {
  try {
    const active = db.getActiveResume();
    if (!active) {
      return res.status(404).send('No active resume available.');
    }

    const filePath = path.join(__dirname, '..', '..', active.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Resume file not found on server.');
    }

    const mime = active.mimeType || 'application/pdf';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).send('Could not preview resume.');
  }
});

// ------------------------------------------------------------------------------
// ADMIN: GET /api/admin/resume - List all uploaded resumes
// ------------------------------------------------------------------------------
router.get('/admin/resume', requireAdmin, (req, res) => {
  try {
    const resumes = db.getResumes();
    res.json({
      success: true,
      resumes,
      activeResumeId: db.data.activeResumeId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve resumes.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: POST /api/admin/resume/upload - File Picker or Drag & Drop
// ------------------------------------------------------------------------------
router.post('/admin/resume/upload', requireAdmin, (req, res) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file was uploaded.' });
    }

    const relativePath = path.join('uploads', 'resumes', req.file.filename).replace(/\\/g, '/');

    const newResume = {
      id: 'res-' + Date.now(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: relativePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      source: 'upload',
      isActive: true // Newly uploaded resume becomes active by default
    };

    const saved = db.addResume(newResume);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and set as active.',
      resume: saved
    });
  });
});

// ------------------------------------------------------------------------------
// ADMIN: POST /api/admin/resume/drive-import - Google Drive Picker Import
// ------------------------------------------------------------------------------
router.post('/admin/resume/drive-import', requireAdmin, async (req, res) => {
  try {
    const { fileId, name, mimeType, size, accessToken, webViewLink } = req.body;

    if (!fileId || !name) {
      return res.status(400).json({ success: false, error: 'Google Drive fileId and name are required.' });
    }

    // Verify file extension
    const ext = path.extname(name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return res.status(400).json({ success: false, error: 'Google Drive file must be a PDF, DOC, or DOCX document.' });
    }

    const uniqueFilename = `${Date.now()}_gdrive_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destinationPath = path.join(RESUMES_DIR, uniqueFilename);
    const relativePath = path.join('uploads', 'resumes', uniqueFilename).replace(/\\/g, '/');

    // If an OAuth access token is provided, download file directly to persistent storage
    if (accessToken) {
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const fileStream = fs.createWriteStream(destinationPath);

      const request = https.get(driveUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }, (response) => {
        if (response.statusCode !== 200) {
          fileStream.close();
          fs.unlinkSync(destinationPath);
          return res.status(400).json({
            success: false,
            error: `Failed to download file from Google Drive (Status ${response.statusCode}). Please check permissions.`
          });
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(destinationPath);

          const driveResume = {
            id: 'res-gdrive-' + Date.now(),
            filename: uniqueFilename,
            originalName: name,
            path: relativePath,
            fileSize: stats.size,
            mimeType: mimeType || 'application/pdf',
            uploadDate: new Date().toISOString(),
            source: 'google-drive',
            driveFileId: fileId,
            driveWebViewLink: webViewLink || '',
            isActive: true
          };

          const saved = db.addResume(driveResume);
          return res.json({
            success: true,
            message: 'Resume downloaded from Google Drive and set as active.',
            resume: saved
          });
        });
      });

      request.on('error', (downloadErr) => {
        if (fs.existsSync(destinationPath)) fs.unlinkSync(destinationPath);
        return res.status(500).json({ success: false, error: 'Download from Google Drive failed: ' + downloadErr.message });
      });
    } else {
      // In case user provided selected drive metadata
      const driveResume = {
        id: 'res-gdrive-' + Date.now(),
        filename: uniqueFilename,
        originalName: name,
        path: 'assets/Kishor_Kumar_Resume.pdf', // fallback link
        fileSize: size || 1024,
        mimeType: mimeType || 'application/pdf',
        uploadDate: new Date().toISOString(),
        source: 'google-drive-link',
        driveFileId: fileId,
        driveWebViewLink: webViewLink || '',
        isActive: true
      };

      const saved = db.addResume(driveResume);
      res.json({
        success: true,
        message: 'Google Drive document linked and set as active.',
        resume: saved
      });
    }
  } catch (err) {
    console.error('Error importing from Drive:', err);
    res.status(500).json({ success: false, error: 'Google Drive import failed.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: PUT /api/admin/resume/active/:id - Switch active resume
// ------------------------------------------------------------------------------
router.put('/admin/resume/active/:id', requireAdmin, (req, res) => {
  try {
    const success = db.setActiveResume(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }
    res.json({
      success: true,
      message: 'Active resume updated.',
      activeResumeId: req.params.id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update active resume.' });
  }
});

// ------------------------------------------------------------------------------
// ADMIN: DELETE /api/admin/resume/:id - Delete a resume
// ------------------------------------------------------------------------------
router.delete('/admin/resume/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteResume(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }
    res.json({
      success: true,
      message: 'Resume deleted successfully.',
      activeResumeId: db.data.activeResumeId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete resume.' });
  }
});

module.exports = router;
