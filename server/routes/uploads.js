import express from 'express';
import multer from 'multer';
import FileStorage from '../models/FileStorage.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// Use memory storage for direct database persistence in serverless environments
const memoryStorage = multer.memoryStorage();

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
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
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
  storage: memoryStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB
}).single('video');

const uploadPdf = multer({
  storage: memoryStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single('pdf');

const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
}).single('image');

// Helper to determine base public API URL
const getBaseApiUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

// ─── STREAM / SERVE PERMANENT FILE ──────────────────────
// GET /api/uploads/file/:id — stream stored file directly with inline embedding headers
router.get('/file/:id', async (req, res) => {
  try {
    const file = await FileStorage.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', file.size || file.data.length);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('X-Frame-Options'); // Allow iframe embedding

    return res.send(file.data);
  } catch (err) {
    console.error('[STREAM ERROR]', err);
    return res.status(500).json({ message: 'Failed to stream file.' });
  }
});

// ─── UPLOAD ENDPOINTS (PROTECTED) ──────────────────────

// POST /api/uploads/pdf — Upload PDF document
router.post('/pdf', protect, requireRole('instructor', 'admin'), (req, res) => {
  uploadPdf(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'PDF upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a PDF file to upload.' });
    }

    try {
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}-${cleanName}`;

      const savedFile = new FileStorage({
        filename: uniqueName,
        originalName: req.file.originalname,
        contentType: req.file.mimetype || 'application/pdf',
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: req.user?.id || null,
      });
      await savedFile.save();

      const base = getBaseApiUrl(req);
      const publicUrl = `${base}/api/uploads/file/${savedFile._id}`;

      res.status(201).json({
        success: true,
        message: 'PDF uploaded and saved permanently to cloud database.',
        fileId: savedFile._id,
        url: publicUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    } catch (dbErr) {
      console.error('[PDF DB SAVE ERROR]', dbErr);
      res.status(500).json({ message: 'Failed to persist uploaded document.' });
    }
  });
});

// POST /api/uploads/video — Upload Video file
router.post('/video', protect, requireRole('instructor', 'admin'), (req, res) => {
  uploadVideo(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Video upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a video file to upload.' });
    }

    try {
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}-${cleanName}`;

      const savedFile = new FileStorage({
        filename: uniqueName,
        originalName: req.file.originalname,
        contentType: req.file.mimetype || 'video/mp4',
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: req.user?.id || null,
      });
      await savedFile.save();

      const base = getBaseApiUrl(req);
      const publicUrl = `${base}/api/uploads/file/${savedFile._id}`;

      res.status(201).json({
        success: true,
        message: 'Video uploaded and saved permanently to cloud database.',
        fileId: savedFile._id,
        url: publicUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    } catch (dbErr) {
      console.error('[VIDEO DB SAVE ERROR]', dbErr);
      res.status(500).json({ message: 'Failed to persist uploaded video.' });
    }
  });
});

// POST /api/uploads/image — Upload Image / Thumbnail
router.post('/image', protect, requireRole('instructor', 'admin'), (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Image upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload.' });
    }

    try {
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}-${cleanName}`;

      const savedFile = new FileStorage({
        filename: uniqueName,
        originalName: req.file.originalname,
        contentType: req.file.mimetype || 'image/png',
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: req.user?.id || null,
      });
      await savedFile.save();

      const base = getBaseApiUrl(req);
      const publicUrl = `${base}/api/uploads/file/${savedFile._id}`;

      res.status(201).json({
        success: true,
        message: 'Image uploaded and saved successfully.',
        fileId: savedFile._id,
        url: publicUrl,
        fileName: req.file.originalname,
      });
    } catch (dbErr) {
      console.error('[IMAGE DB SAVE ERROR]', dbErr);
      res.status(500).json({ message: 'Failed to persist uploaded image.' });
    }
  });
});

// POST /api/uploads/validate-url — Validate direct media URL
router.post('/validate-url', protect, (req, res) => {
  const { url, expectedType } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ valid: false, message: 'URL string is required.' });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ valid: false, message: 'URL must use http or https protocol.' });
    }

    const pathname = parsed.pathname.toLowerCase();
    if (expectedType === 'video') {
      const isDirectVideo = /\.(mp4|webm|mov|mkv|ogg)$/.test(pathname);
      const isEmbedVideo = /(youtube\.com|youtu\.be|vimeo\.com|wistia\.com|cloudinary\.com)/.test(parsed.hostname);
      return res.json({
        valid: isDirectVideo || isEmbedVideo,
        type: isDirectVideo ? 'direct' : 'embed',
        url,
      });
    } else if (expectedType === 'pdf') {
      const isPdf = pathname.endsWith('.pdf') || pathname.includes('/pdf');
      return res.json({
        valid: isPdf,
        type: 'document',
        url,
      });
    }

    res.json({ valid: true, url });
  } catch (err) {
    res.status(400).json({ valid: false, message: 'Invalid URL format.' });
  }
});

export default router;
