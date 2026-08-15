import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import CreditTransaction from '../models/CreditTransaction.js';
import EventRegistration from '../models/EventRegistration.js';
import Certificate from '../models/Certificate.js';
import Mentor from '../models/Mentor.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendAutomatedNotification } from '../utils/notify.js';
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
      mentorsCount,
      coursesCount,
      publishedCoursesCount,
      pendingReviewsCount,
      draftCoursesCount,
      enrollmentsCount,
      transactions,
      registrationsCount,
      certificatesCount,
      totalUsersCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'mentor' }),
      Course.countDocuments({}),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      Course.countDocuments({ status: 'draft' }),
      Enrollment.countDocuments({}),
      CreditTransaction.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
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
        return { 
          id: cp._id,
          title: course?.title || 'General Engineering Track', 
          category: course?.category || 'Web Development', 
          count: cp.count 
        };
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
        mentorsCount: mentorsCount || 0,
        coursesCount,
        publishedCoursesCount,
        pendingReviewsCount,
        draftCoursesCount,
        enrollmentsCount,
        registrationsCount,
        certificatesCount,
        creditsEarnedSum: totalCreditsEarned[0]?.total || 0,
        creditsSpentSum: totalCreditsSpent[0]?.total || 0,
        recentTransactions: transactions.map(t => ({
          _id: t._id,
          userName: t.userId?.name || 'Platform Member',
          userEmail: t.userId?.email || '',
          type: t.type,
          amount: t.amount,
          reason: t.reason,
          createdAt: t.createdAt
        })),
        coursePopularity: populatedPopularity,
        recentActivityCount,
      }
    });
  } catch (err) { next(err); }
});

// ─── COURSE REVIEW & MODERATION WORKFLOW ─────────────────

// GET /api/admin/courses/pending — list submitted courses awaiting moderation
router.get('/courses/pending', async (req, res, next) => {
  try {
    const courses = await Course.find({ status: { $in: ['submitted', 'under_review'] } })
      .populate('createdBy instructorId', 'name email role')
      .sort('-updatedAt')
      .lean();

    const enriched = await Promise.all(courses.map(async (c) => {
      const modules = await Module.find({ courseId: c._id }).sort('order').lean();
      const moduleIds = modules.map(m => m._id);
      const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort('order').lean();

      return {
        ...c,
        modules,
        moduleCount: modules.length,
        lessonCount: lessons.length,
        instructorName: c.instructorId?.name || c.createdBy?.name || 'Faculty Member',
        instructorEmail: c.instructorId?.email || c.createdBy?.email || '',
      };
    }));

    res.json(enriched);
  } catch (err) { next(err); }
});

// GET /api/admin/courses/:id/preview — full curriculum preview for admin review
router.get('/courses/:id/preview', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy instructorId', 'name email role')
      .lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const modules = await Module.find({ courseId: course._id }).sort('order').lean();
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort('order').lean();
        const quiz = await Quiz.findOne({ moduleId: mod._id }).lean();
        return { ...mod, lessons, quiz };
      })
    );

    res.json({
      ...course,
      modules: modulesWithLessons,
      instructorName: course.instructorId?.name || course.createdBy?.name || 'Faculty Member',
    });
  } catch (err) { next(err); }
});

// PUT /api/admin/courses/:id/approve — approve submitted course and publish
router.put('/courses/:id/approve', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    course.status = 'published';
    course.rejectionReason = '';
    await course.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'COURSE_APPROVED_AND_PUBLISHED',
      target: course.title,
      metadata: { courseId: course._id, courseType: course.courseType },
    });

    if (course.createdBy) {
      const instructor = await User.findById(course.createdBy);
      if (instructor) {
        sendAutomatedNotification({
          userId: instructor._id,
          userName: instructor.name,
          userEmail: instructor.email,
          message: `Congratulations! Your course "${course.title}" has been APPROVED and is now PUBLISHED in Explore Tracks.`,
          type: 'achievement',
        });
      }
    }

    res.json({ success: true, message: `Course "${course.title}" is now published!`, course });
  } catch (err) { next(err); }
});

// PUT /api/admin/courses/:id/reject — reject submitted course with feedback
router.put('/courses/:id/reject', async (req, res, next) => {
  try {
    const { rejectionReason = 'Does not meet curriculum guidelines.' } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    course.status = 'rejected';
    course.rejectionReason = rejectionReason;
    await course.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'COURSE_REJECTED',
      target: course.title,
      metadata: { courseId: course._id, reason: rejectionReason },
    });

    if (course.createdBy) {
      const instructor = await User.findById(course.createdBy);
      if (instructor) {
        sendAutomatedNotification({
          userId: instructor._id,
          userName: instructor.name,
          userEmail: instructor.email,
          message: `Your course submission "${course.title}" requires revisions: ${rejectionReason}`,
          type: 'alert',
        });
      }
    }

    res.json({ success: true, message: `Course "${course.title}" rejected with feedback.`, course });
  } catch (err) { next(err); }
});

// PUT /api/admin/courses/:id/status — toggle published / unpublished status
router.put('/courses/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['published', 'unpublished', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const course = await Course.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'COURSE_STATUS_TOGGLED',
      target: course.title,
      metadata: { newStatus: status },
    });

    res.json({ success: true, message: `Course status set to ${status}.`, course });
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
      .select('name email role creditsBalance createdAt careerReadinessScore')
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

// PUT /api/admin/users/:id/credits — adjust user credits
router.put('/users/:id/credits', async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const adjustAmount = Number(amount);
    if (isNaN(adjustAmount) || adjustAmount === 0) {
      return res.status(400).json({ message: 'Valid credit adjustment amount is required.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.creditsBalance = Math.max(0, user.creditsBalance + adjustAmount);
    await user.save();

    await CreditTransaction.create({
      userId: user._id,
      type: adjustAmount > 0 ? 'EARN' : 'SPEND',
      amount: Math.abs(adjustAmount),
      reason: reason || `Administrator credit adjustment by ${req.user.name}`,
    });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREDITS_ADJUSTED',
      target: user.name,
      metadata: { email: user.email, adjustedBy: adjustAmount, newBalance: user.creditsBalance },
    });

    res.json({ message: `Updated ${user.name}'s balance to ${user.creditsBalance} credits.`, creditsBalance: user.creditsBalance });
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

// ─── COURSES & CONTENT GOVERNANCE ───────────────────────

// GET /api/admin/courses — list all courses with statistics
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find({})
      .populate('createdBy instructorId', 'name email')
      .sort('-createdAt')
      .lean();

    const enriched = await Promise.all(courses.map(async (c) => {
      const enrollmentsCount = await Enrollment.countDocuments({ courseId: c._id });
      const modules = await Module.find({ courseId: c._id }).select('_id').lean();
      const lessonCount = await Lesson.countDocuments({ moduleId: { $in: modules.map(m => m._id) } });

      return {
        ...c,
        instructorName: c.instructorId?.name || c.createdBy?.name || 'Faculty Member',
        instructorEmail: c.instructorId?.email || c.createdBy?.email || '',
        moduleCount: modules.length,
        lessonCount,
        enrollmentsCount
      };
    }));

    res.json(enriched);
  } catch (err) { next(err); }
});

// DELETE /api/admin/courses/:id — delete course by admin
router.delete('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const modules = await Module.find({ courseId: course._id }).select('_id').lean();
    const moduleIds = modules.map(m => m._id);

    await Promise.all([
      Lesson.deleteMany({ moduleId: { $in: moduleIds } }),
      Quiz.deleteMany({ moduleId: { $in: moduleIds } }),
      Module.deleteMany({ courseId: course._id }),
      Enrollment.deleteMany({ courseId: course._id }),
      Course.deleteOne({ _id: course._id }),
    ]);

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'COURSE_DELETED_BY_ADMIN',
      target: course.title,
    });

    res.json({ message: `Course "${course.title}" and all related content removed.` });
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
