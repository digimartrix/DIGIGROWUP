import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
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

// POST /api/courses/:id/enroll — enroll in a new course and set it as active
router.post('/:id/enroll', protect, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const courseExists = await Course.findById(courseId);
    if (!courseExists) return res.status(404).json({ message: 'Course not found.' });

    // Find or create enrollment
    let enrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: req.user.id,
        courseId,
        completedLessons: []
      });
    }

    // Set as active course
    await User.findByIdAndUpdate(req.user.id, { activeCourseId: courseId });

    res.json({ message: 'Enrolled successfully.', courseId });
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
