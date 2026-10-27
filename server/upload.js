/**
 * ==============================================================================
 * KISHOR KUMAR PORTFOLIO - SECURE FILE UPLOAD HANDLER
 * Server-side validation for resumes (PDF, DOC, DOCX) and images (JPG, PNG, WebP)
 * ==============================================================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const RESUMES_DIR = path.join(__dirname, '..', 'uploads', 'resumes');
const IMAGES_DIR = path.join(__dirname, '..', 'uploads', 'images');

// Ensure upload directories exist (with safety check for read-only serverless platforms like Vercel)
[RESUMES_DIR, IMAGES_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[UPLOAD INIT] Directory initialization deferred for ${dir} (read-only environment):`, err.message);
  }
});

// ------------------------------------------------------------------------------
// Resume Storage & Filter Config (PDF, DOC, DOCX - Max 15MB)
// ------------------------------------------------------------------------------
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUMES_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${base}${ext}`;
    cb(null, unique);
  }
});

function resumeFileFilter(req, file, cb) {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream' // Some browsers send octet-stream for docx
  ];

  if (allowedExtensions.includes(ext) && (allowedMimes.includes(file.mimetype) || ext === '.docx' || ext === '.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
}

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabytes
  }
});

// ------------------------------------------------------------------------------
// Image Storage & Filter Config (JPG, JPEG, PNG, WEBP - Max 10MB)
// ------------------------------------------------------------------------------
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${base}${ext}`;
    cb(null, unique);
  }
});

function imageFileFilter(req, file, cb) {
  // SVG disallowed to prevent Stored XSS attacks via embedded scripts
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedExtensions.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only secure raster formats (JPG, JPEG, PNG, and WEBP) are allowed.'), false);
  }
}

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Megabytes
  }
});

module.exports = {
  resumeUpload,
  imageUpload,
  RESUMES_DIR,
  IMAGES_DIR
};
