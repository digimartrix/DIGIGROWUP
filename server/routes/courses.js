import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import LessonProgress from '../models/LessonProgress.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendAutomatedNotification } from '../utils/notify.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses — returns catalog courses (for students: published courses only)
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, difficulty, courseType, search } = req.query;
    
    // Students only see published courses; Admins/Instructors can see all if requested
    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    if (courseType && courseType !== 'All') {
      filter.courseType = courseType;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ];
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'name email role')
      .populate('instructorId', 'name email role')
      .sort('-createdAt')
      .lean();

    // Get all enrollments for current user to mark isEnrolled
    const userEnrollments = await Enrollment.find({ userId: req.user.id }).lean();
    const enrolledMap = new Map(userEnrollments.map(e => [e.courseId.toString(), e]));

    // Attach modules, lessons count, and enrollment state
    const enriched = await Promise.all(
      courses.map(async (c) => {
        const modules = await Module.find({ courseId: c._id }).select('_id').lean();
        const moduleIds = modules.map(m => m._id);
        const lessonCount = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });
        const enrollment = enrolledMap.get(c._id.toString());

        return {
          ...c,
          moduleCount: modules.length,
          lessonCount,
          isEnrolled: !!enrollment,
          progress: enrollment ? enrollment.progress : 0,
          instructorName: c.instructorId?.name || c.createdBy?.name || 'DigiLearning Faculty',
        };
      })
    );

    res.json(enriched);
  } catch (err) { next(err); }
});

// GET /api/courses/my-learning — returns all enrolled courses for the logged-in student
router.get('/my-learning', protect, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate({
        path: 'courseId',
        populate: { path: 'createdBy instructorId', select: 'name email role' }
      })
      .populate('lastAccessedLesson')
      .sort('-updatedAt')
      .lean();

    const validEnrollments = enrollments.filter(e => e.courseId);

    const myCourses = await Promise.all(
      validEnrollments.map(async (e) => {
        const course = e.courseId;
        const modules = await Module.find({ courseId: course._id }).sort('order').lean();
        const moduleIds = modules.map(m => m._id);
        const allLessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort('order').lean();
        
        const totalLessons = allLessons.length;
        const completedCount = e.completedLessons?.length || 0;
        const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

        // Determine next lesson to continue: either lastAccessedLesson or first incomplete lesson
        let nextLesson = null;
        if (e.lastAccessedLesson) {
          nextLesson = allLessons.find(l => l._id.toString() === e.lastAccessedLesson._id?.toString() || l._id.toString() === e.lastAccessedLesson.toString());
        }
        if (!nextLesson) {
          const completedSet = new Set((e.completedLessons || []).map(id => id.toString()));
          nextLesson = allLessons.find(l => !completedSet.has(l._id.toString())) || allLessons[0] || null;
        }

        // Find module for nextLesson
        let nextLessonModule = null;
        if (nextLesson) {
          nextLessonModule = modules.find(m => m._id.toString() === nextLesson.moduleId.toString());
        }

        return {
          enrollmentId: e._id,
          status: e.status,
          progress: progressPct,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          completedLessons: e.completedLessons || [],
          course: {
            ...course,
            instructorName: course.instructorId?.name || course.createdBy?.name || 'DigiLearning Faculty',
          },
          totalModules: modules.length,
          totalLessons,
          completedLessonsCount: completedCount,
          nextLesson: nextLesson ? {
            _id: nextLesson._id,
            title: nextLesson.title,
            type: nextLesson.type || course.courseType || 'video',
            duration: nextLesson.duration || 0,
            moduleTitle: nextLessonModule?.title || 'Course Content',
          } : null,
        };
      })
    );

    res.json(myCourses);
  } catch (err) { next(err); }
});

// GET /api/courses/enrolled-list — returns all course IDs the student is enrolled in
router.get('/enrolled-list', protect, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).select('courseId progress status').lean();
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
      const firstEnroll = await Enrollment.findOne({ userId: req.user.id }).sort('-updatedAt').lean();
      if (!firstEnroll) return res.json(null);
      activeId = firstEnroll.courseId;
      
      // Update user with active course
      dbUser.activeCourseId = activeId;
      await dbUser.save();
    }

    const course = await Course.findById(activeId)
      .populate('createdBy instructorId', 'name email role')
      .lean();
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
    const allLessonCount = modulesWithLessons.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedCount = enrollment?.completedLessons?.length || 0;
    const progressPct = allLessonCount > 0 ? Math.min(100, Math.round((completedCount / allLessonCount) * 100)) : 0;

    res.json({
      ...course,
      modules: modulesWithLessons,
      completedLessons: enrollment?.completedLessons || [],
      progress: progressPct,
      lastAccessedLesson: enrollment?.lastAccessedLesson || null,
      instructorName: course.instructorId?.name || course.createdBy?.name || 'DigiLearning Faculty',
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
    const newEnrollment = await Enrollment.create({
      userId: user._id,
      studentId: user._id,
      courseId,
      progress: 0,
      completedLessons: [],
      status: 'active',
      enrolledAt: new Date(),
    });

    // Increment course enrollmentCount
    courseExists.enrollmentCount = (courseExists.enrollmentCount || 0) + 1;
    await courseExists.save();

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

    // Automated notification
    sendAutomatedNotification({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      message: cost > 0
        ? `Enrolled in "${courseExists.title}" (Cost: ${cost} DigiCredits). Remaining balance: ${user.creditsBalance} credits.`
        : `Enrolled in starter track "${courseExists.title}" successfully!`,
      type: 'reward'
    });

    res.json({
      success: true,
      message: cost > 0 ? `Successfully unlocked "${courseExists.title}" for ${cost} DigiCredits!` : `Enrolled in "${courseExists.title}"!`,
      courseId,
      enrollment: newEnrollment,
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
    const course = await Course.findById(req.params.id)
      .populate('createdBy instructorId', 'name email role')
      .lean();
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
    const totalLessons = modulesWithLessons.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedCount = enrollment?.completedLessons?.length || 0;
    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    res.json({
      ...course,
      modules: modulesWithLessons,
      completedLessons: enrollment?.completedLessons || [],
      isEnrolled: !!enrollment,
      progress: progressPct,
      lastAccessedLesson: enrollment?.lastAccessedLesson || null,
      instructorName: course.instructorId?.name || course.createdBy?.name || 'DigiLearning Faculty',
    });
  } catch (err) { next(err); }
});

export default router;
