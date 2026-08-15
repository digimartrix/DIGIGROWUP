import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directories exist safely in serverless (/tmp) and local environments
const uploadBaseDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
const videoDir = path.join(uploadBaseDir, 'videos');
const pdfDir = path.join(uploadBaseDir, 'documents');
const imageDir = path.join(uploadBaseDir, 'images');

[uploadBaseDir, videoDir, pdfDir, imageDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn('[UPLOADS] Could not create upload directory:', err.message);
  }
});

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (file.mimetype.startsWith('video/')) {
        if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
        cb(null, videoDir);
      } else if (file.mimetype === 'application/pdf') {
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
        cb(null, pdfDir);
      } else if (file.mimetype.startsWith('image/')) {
        if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
        cb(null, imageDir);
      } else {
        if (!fs.existsSync(uploadBaseDir)) fs.mkdirSync(uploadBaseDir, { recursive: true });
        cb(null, uploadBaseDir);
      }
    } catch (e) {
      cb(null, '/tmp');
    }
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

// File Filters
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Supported formats: MP4, WebM, MOV.'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF files are supported.'), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported formats: JPG, PNG, WebP.'), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB
}).single('video');

const uploadPdf = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single('pdf');

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
}).single('image');

// Only authenticated instructors or admins can upload course files
router.use(protect, requireRole('instructor', 'admin'));

// POST /api/uploads/video — upload video file
router.post('/video', (req, res) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Video upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const relativePath = `/uploads/videos/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativePath}`;

    res.status(201).json({
      success: true,
      url: fullUrl,
      relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      type: 'video',
      uploadStatus: 'ready',
      duration: req.body.duration ? Number(req.body.duration) : 0,
    });
  });
});

// POST /api/uploads/pdf — upload PDF file
router.post('/pdf', (req, res) => {
  uploadPdf(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'PDF upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const relativePath = `/uploads/documents/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativePath}`;

    res.status(201).json({
      success: true,
      url: fullUrl,
      relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      type: 'pdf',
      uploadStatus: 'ready',
    });
  });
});

// POST /api/uploads/image — upload course thumbnail or banner
router.post('/image', (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Image upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const relativePath = `/uploads/images/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativePath}`;

    res.status(201).json({
      success: true,
      url: fullUrl,
      relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      type: 'image',
    });
  });
});

// POST /api/uploads/validate-url — validate external URL for video or PDF
router.post('/validate-url', (req, res) => {
  const { url, type } = req.body;
  if (!url || !url.trim().startsWith('http')) {
    return res.status(400).json({ message: 'Please provide a valid HTTP/HTTPS URL.' });
  }

  const cleanUrl = url.trim();
  res.json({
    success: true,
    url: cleanUrl,
    type: type || 'video',
    uploadStatus: 'ready',
    fileName: cleanUrl.split('/').pop() || 'External Media',
  });
});

export default router;
