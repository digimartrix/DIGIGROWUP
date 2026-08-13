import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const signToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      const { name, email, password, role } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

      const assignedRole = ['student', 'instructor', 'mentor'].includes(role) ? role : 'student';
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash, role: assignedRole });

      // Auto-enroll in the seeded course
      const seededCourse = await Course.findOne({});
      if (seededCourse) {
        await Enrollment.create({ userId: user._id, courseId: seededCourse._id }).catch(() => {});
      }

      const token = signToken(user);

      // Create welcome notification in MongoDB
      Notification.create({
        userId: user._id,
        message: `Welcome to DigiGrowUp, ${user.name}! Your account is active with role ${user.role.toUpperCase()}. You have ${user.creditsBalance || 245} DigiCredits.`,
        type: 'reward',
        read: false
      }).catch(() => {});

      // Asynchronously sync registration with Google Apps Script
      const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwUD3QyiFho_cTag9RWgD5AS3VAj8eG3dCt5veAGtD0CsTe1LFsh7NyN8GCnmqYI4cYdw/exec';
      if (appsScriptUrl) {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            content: `New user registration: ${user.name} (${user.email}) registered as ${user.role.toUpperCase()}. Assigned ${user.creditsBalance || 245} DigiCredits.`,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.warn('[APPS_SCRIPT_NOTIF_SYNC_FAILED]', err.message));
      }

      // Log registration
      ActivityLog.create({ userId: user._id, userName: user.name, userRole: user.role, action: 'USER_REGISTERED', target: user.name }).catch(() => {});

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

      // Auto-enroll if not already enrolled
      const seededCourse = await Course.findOne({});
      if (seededCourse) {
        await Enrollment.create({ userId: user._id, courseId: seededCourse._id }).catch(() => {});
      }

      const token = signToken(user);

      // Log login
      ActivityLog.create({ userId: user._id, userName: user.name, userRole: user.role, action: 'USER_LOGGED_IN', target: user.name }).catch(() => {});

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/auth/profile - Update user profile details
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(409).json({ message: 'Email already in use.' });
      user.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
      user.passwordHash = await bcrypt.hash(password, 12);

      await ActivityLog.create({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        action: 'PASSWORD_UPDATED',
        target: user.name
      }).catch(() => {});
    }
    await user.save();

    // Re-sign token
    const token = signToken(user);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me - Get current user profile and role
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email role creditsBalance activeCourseId');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creditsBalance: user.creditsBalance,
        activeCourseId: user.activeCourseId
      }
    });
  } catch (err) { next(err); }
});

export default router;
