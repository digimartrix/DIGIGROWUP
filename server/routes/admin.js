import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import CreditTransaction from '../models/CreditTransaction.js';
import EventRegistration from '../models/EventRegistration.js';
import Certificate from '../models/Certificate.js';
import Mentor from '../models/Mentor.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, requireRole('admin'));

// ─── OVERVIEW STATS ────────────────────────────────────

// GET /api/admin/overview — Real-time statistics summary
router.get('/overview', async (req, res, next) => {
  try {
    const [
      studentsCount,
      instructorsCount,
      adminsCount,
      coursesCount,
      enrollmentsCount,
      mentorsCount,
      transactions,
      registrationsCount,
      certificatesCount,
      totalUsersCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments({}),
      Enrollment.countDocuments({}),
      Mentor.countDocuments({}),
      CreditTransaction.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      EventRegistration.countDocuments({}),
      Certificate.countDocuments({}),
      User.countDocuments({}),
    ]);

    const totalCreditsEarned = await CreditTransaction.aggregate([
      { $match: { type: { $in: ['EARN', 'BONUS'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCreditsSpent = await CreditTransaction.aggregate([
      { $match: { type: 'SPEND' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const coursePopularity = await Enrollment.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const populatedPopularity = await Promise.all(
      coursePopularity.map(async (cp) => {
        const course = await Course.findById(cp._id).select('title category').lean();
        return { title: course?.title || 'Unknown', category: course?.category || 'General', count: cp.count };
      })
    );

    // Recent activity count (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivityCount = await ActivityLog.countDocuments({ createdAt: { $gte: oneDayAgo } });

    res.json({
      success: true,
      data: {
        totalUsersCount,
        studentsCount,
        instructorsCount,
        adminsCount,
        coursesCount,
        enrollmentsCount,
        mentorsCount,
        registrationsCount,
        certificatesCount,
        creditsEarnedSum: totalCreditsEarned[0]?.total || 0,
        creditsSpentSum: totalCreditsSpent[0]?.total || 0,
        recentTransactions: transactions,
        coursePopularity: populatedPopularity,
        recentActivityCount,
      }
    });
  } catch (err) { next(err); }
});

// ─── USER MANAGEMENT ───────────────────────────────────

// GET /api/admin/users — list all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('name email role creditsBalance createdAt')
      .sort('-createdAt')
      .limit(100)
      .lean();

    // Attach enrollment count per user
    const enriched = await Promise.all(users.map(async (u) => {
      const enrollmentCount = await Enrollment.countDocuments({ userId: u._id });
      return { ...u, enrollmentCount };
    }));

    res.json(enriched);
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role — change user role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'mentor', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_ROLE_CHANGED',
      target: user.name,
      metadata: { email: user.email, oldRole, newRole: role },
    });

    res.json({ message: `${user.name} is now ${role}.`, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id — delete a user
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await User.deleteOne({ _id: user._id });
    await Enrollment.deleteMany({ userId: user._id });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_DELETED',
      target: user.name,
      metadata: { email: user.email, role: user.role },
    });

    res.json({ message: `User ${user.name} deleted.` });
  } catch (err) { next(err); }
});

// ─── ACTIVITY LOGS ─────────────────────────────────────

// GET /api/admin/logs — paginated activity logs
router.get('/logs', async (req, res, next) => {
  try {
    const { action, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (action && action !== 'all') filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

export default router;
