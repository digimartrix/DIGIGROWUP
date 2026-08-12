import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses — returns all courses (brief list)
router.get('/', protect, async (req, res, next) => {
  try {
    const courses = await Course.find({}).lean();
    res.json(courses);
  } catch (err) { next(err); }
});

// GET /api/courses/enrolled-list — returns all course IDs the student is enrolled in
router.get('/enrolled-list', protect, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).select('courseId status').lean();
    res.json(enrollments);
  } catch (err) { next(err); }
});

// GET /api/courses/enrolled — returns the currently active enrolled course with full tree
router.get('/enrolled', protect, async (req, res, next) => {
  try {
    const dbUser = await User.findById(req.user.id);
    let activeId = dbUser?.activeCourseId;

    if (!activeId) {
      // Find the first enrollment if no activeCourseId is set
      const firstEnroll = await Enrollment.findOne({ userId: req.user.id }).lean();
      if (!firstEnroll) return res.json(null);
      activeId = firstEnroll.courseId;
      
      // Update user with active course
      dbUser.activeCourseId = activeId;
      await dbUser.save();
    }

    const course = await Course.findById(activeId).lean();
    if (!course) return res.json(null);

    const modules = await Module.find({ courseId: course._id }).sort('order').lean();
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort('order').lean();
        const quiz = await Quiz.findOne({ moduleId: mod._id }).lean();
        return { ...mod, lessons, quizId: quiz?._id || null };
      })
    );

    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: course._id }).lean();

    res.json({
      ...course,
      modules: modulesWithLessons,
      completedLessons: enrollment?.completedLessons || [],
    });
  } catch (err) { next(err); }
});

// POST /api/courses/:id/enroll — enroll in a new course with DigiCredits validation
router.post('/:id/enroll', protect, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const courseExists = await Course.findById(courseId);
    if (!courseExists) return res.status(404).json({ message: 'Course not found.' });

    // Check if already enrolled
    let existingEnrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existingEnrollment) {
      await User.findByIdAndUpdate(req.user.id, { activeCourseId: courseId });
      return res.json({ message: 'Course is already in your learning center.', courseId, alreadyEnrolled: true });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User account not found.' });

    const cost = Number(courseExists.creditsCost || 0);

    // Validate DigiCredits balance if course is not free
    if (cost > 0) {
      if ((user.creditsBalance || 0) < cost) {
        return res.status(400).json({
          message: `Insufficient DigiCredits! You have ${user.creditsBalance || 0} credits, but this course requires ${cost} credits. Complete challenges in Code Arena or quizzes to earn more!`,
          requiredCredits: cost,
          currentBalance: user.creditsBalance || 0
        });
      }

      // Deduct credits
      user.creditsBalance -= cost;
      await user.save();

      // Record SPEND transaction
      await CreditTransaction.create({
        userId: user._id,
        type: 'SPEND',
        amount: cost,
        reason: `Enrolled in Course: ${courseExists.title}`,
        referenceId: courseExists._id,
      });

      // If course was authored by an instructor/mentor, credit them with royalties
      if (courseExists.createdBy && String(courseExists.createdBy) !== String(user._id)) {
        const royaltyAmount = Math.round(cost * 0.8);
        const author = await User.findById(courseExists.createdBy);
        if (author) {
          author.creditsBalance = (author.creditsBalance || 0) + royaltyAmount;
          await author.save();

          await CreditTransaction.create({
            userId: author._id,
            type: 'EARN',
            amount: royaltyAmount,
            reason: `Course Royalty: Learner enrolled in "${courseExists.title}"`,
            referenceId: courseExists._id,
          });
        }
      }
    }

    // Create enrollment
    await Enrollment.create({
      userId: user._id,
      courseId,
      completedLessons: []
    });

    // Set as active course
    user.activeCourseId = courseId;
    await user.save();

    // Log enrollment event
    ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'COURSE_ENROLLED',
      target: courseExists.title,
      metadata: { creditsCost: cost, remainingBalance: user.creditsBalance }
    }).catch(() => {});

    res.json({
      success: true,
      message: cost > 0 ? `Successfully unlocked "${courseExists.title}" for ${cost} DigiCredits!` : `Enrolled in "${courseExists.title}"!`,
      courseId,
      creditsBalance: user.creditsBalance
    });
  } catch (err) { next(err); }
});

// POST /api/courses/:id/activate — switch active course
router.post('/:id/activate', protect, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const enrolled = await Enrollment.findOne({ userId: req.user.id, courseId }).lean();
    if (!enrolled) return res.status(400).json({ message: 'You must enroll in this course first.' });

    await User.findByIdAndUpdate(req.user.id, { activeCourseId: courseId });
    res.json({ message: 'Active course updated successfully.', courseId });
  } catch (err) { next(err); }
});

// GET /api/courses/:id — full course details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const modules = await Module.find({ courseId: course._id }).sort('order').lean();
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort('order').lean();
        const quiz = await Quiz.findOne({ moduleId: mod._id }).lean();
        return { ...mod, lessons, quizId: quiz?._id || null };
      })
    );

    const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: course._id }).lean();
    res.json({
      ...course,
      modules: modulesWithLessons,
      completedLessons: enrollment?.completedLessons || [],
    });
  } catch (err) { next(err); }
});

export default router;
