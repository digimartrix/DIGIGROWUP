import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Enrollment from '../models/Enrollment.js';
import LessonProgress from '../models/LessonProgress.js';
import Event from '../models/Event.js';
import Resource from '../models/Resource.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// All instructor routes require instructor or admin role
router.use(protect, requireRole('instructor', 'admin'));

// Helper to log activity
const logActivity = async (user, action, target, metadata = {}) => {
  try {
    await ActivityLog.create({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      target,
      metadata,
    });
  } catch (e) { console.error('[LOG]', e.message); }
};

// ─── STATS & OVERVIEW ───────────────────────────────────

// GET /api/instructor/stats — aggregated real-time instructor metrics
router.get('/stats', async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const courses = await Course.find({ createdBy: instructorId }).lean();
    const courseIds = courses.map(c => c._id);

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;
    const draftCourses = courses.filter(c => c.status === 'draft').length;
    const pendingCourses = courses.filter(c => ['submitted', 'under_review'].includes(c.status)).length;

    // Get all enrollments across instructor's courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();
    const uniqueStudents = new Set(enrollments.map(e => e.userId.toString()));
    const totalStudents = uniqueStudents.size;

    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const avgCompletion = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    res.json({
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingCourses,
      totalStudents,
      totalEnrollments: enrollments.length,
      avgCompletion,
    });
  } catch (err) { next(err); }
});

// ─── COURSE DIRECTORY & CRUD ────────────────────────────

// GET /api/instructor/courses — list all courses created by this instructor
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id }).sort('-createdAt').lean();

    const enriched = await Promise.all(courses.map(async (c) => {
      const modules = await Module.find({ courseId: c._id }).sort('order').lean();
      const moduleIds = modules.map(m => m._id);
      const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort('order').lean();
      
      const enrollments = await Enrollment.find({ courseId: c._id }).lean();
      const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
      const avgCompletion = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

      return {
        ...c,
        modules,
        moduleCount: modules.length,
        lessonCount: lessons.length,
        enrolledStudentsCount: enrollments.length,
        avgCompletion,
      };
    }));

    res.json(enriched);
  } catch (err) { next(err); }
});

// GET /api/instructor/courses/:id — get full course structure for builder
router.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized.' });

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
    });
  } catch (err) { next(err); }
});

// POST /api/instructor/courses — create a new course (Step 1 Info + Step 2 Course Type)
router.post('/courses', async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimatedHours,
      estimatedDuration,
      thumbnail,
      creditsCost,
      courseType = 'video',
      learningObjectives = [],
      prerequisites = [],
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Course title and description are required.' });
    }

    const course = await Course.create({
      title,
      description,
      category: category || 'General',
      difficulty: difficulty || 'Beginner',
      estimatedHours: estimatedHours || 10,
      estimatedDuration: estimatedDuration || `${estimatedHours || 10} hours`,
      thumbnail: thumbnail || '',
      creditsCost: creditsCost !== undefined ? Number(creditsCost) : 0,
      courseType: courseType === 'pdf' ? 'pdf' : 'video',
      status: 'draft',
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      createdBy: req.user.id,
      instructorId: req.user.id,
    });

    // Create an initial default module so the curriculum builder is immediately ready
    const firstModule = await Module.create({
      courseId: course._id,
      title: courseType === 'pdf' ? 'Chapter 1 — Fundamentals' : 'Module 1 — Introduction',
      order: 1,
    });

    await logActivity(req.user, 'COURSE_CREATED', title, { courseType, courseId: course._id });
    res.status(201).json({ ...course.toObject(), modules: [firstModule] });
  } catch (err) { next(err); }
});

// PUT /api/instructor/courses/:id — update course metadata or save draft
router.put('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found or not yours.' });
    await logActivity(req.user, 'COURSE_UPDATED', course.title);
    res.json(course);
  } catch (err) { next(err); }
});

// POST /api/instructor/courses/:id/submit — submit course for Admin Review
router.post('/courses/:id/submit', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // Validate that course has at least 1 module and 1 lesson
    const modules = await Module.find({ courseId: course._id }).select('_id').lean();
    const moduleIds = modules.map(m => m._id);
    const lessonCount = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });

    if (modules.length === 0 || lessonCount === 0) {
      return res.status(400).json({
        message: 'A course must have at least 1 module and 1 lesson before submitting for review.',
      });
    }

    course.status = 'submitted';
    course.rejectionReason = '';
    await course.save();

    await logActivity(req.user, 'COURSE_SUBMITTED', course.title);
    res.json({ success: true, message: 'Course submitted for admin review!', course });
  } catch (err) { next(err); }
});

// DELETE /api/instructor/courses/:id — delete course + all children
router.delete('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) return res.status(404).json({ message: 'Course not found or not yours.' });

    const modules = await Module.find({ courseId: course._id }).select('_id').lean();
    const moduleIds = modules.map(m => m._id);

    await Promise.all([
      Lesson.deleteMany({ moduleId: { $in: moduleIds } }),
      Quiz.deleteMany({ moduleId: { $in: moduleIds } }),
      Module.deleteMany({ courseId: course._id }),
      Enrollment.deleteMany({ courseId: course._id }),
      LessonProgress.deleteMany({ courseId: course._id }),
      Course.deleteOne({ _id: course._id }),
    ]);

    await logActivity(req.user, 'COURSE_DELETED', course.title);
    res.json({ message: 'Course and all associated content deleted successfully.' });
  } catch (err) { next(err); }
});

// ─── MODULES (CHAPTERS) ─────────────────────────────────

// POST /api/instructor/courses/:id/modules — add a new module/chapter
router.post('/courses/:id/modules', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Module title is required.' });

    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const existingCount = await Module.countDocuments({ courseId: course._id });
    const module = await Module.create({
      courseId: course._id,
      title: title.trim(),
      order: existingCount + 1,
    });

    res.status(201).json({ ...module.toObject(), lessons: [] });
  } catch (err) { next(err); }
});

// PUT /api/instructor/modules/:id — rename or reorder module
router.put('/modules/:id', async (req, res, next) => {
  try {
    const { title, order } = req.body;
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (order !== undefined) updateData.order = Number(order);

    const mod = await Module.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!mod) return res.status(404).json({ message: 'Module not found.' });
    res.json(mod);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/modules/:id — delete module and its lessons
router.delete('/modules/:id', async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found.' });

    await Promise.all([
      Lesson.deleteMany({ moduleId: mod._id }),
      Quiz.deleteMany({ moduleId: mod._id }),
      Module.deleteOne({ _id: mod._id }),
    ]);

    res.json({ message: 'Module and its lessons removed.' });
  } catch (err) { next(err); }
});

// ─── LESSONS (VIDEO & PDF) ──────────────────────────────

// POST /api/instructor/modules/:id/lessons — add video or PDF lesson
router.post('/modules/:id/lessons', async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      type = 'video',
      contentUrl = '',
      fileName = '',
      fileSize = 0,
      duration = 0,
      content = '',
      uploadStatus = 'ready',
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Lesson title is required.' });

    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found.' });

    const existingCount = await Lesson.countDocuments({ moduleId: mod._id });

    const lesson = await Lesson.create({
      courseId: mod.courseId,
      moduleId: mod._id,
      title: title.trim(),
      description,
      type: type || 'video',
      contentUrl,
      fileName,
      fileSize: Number(fileSize) || 0,
      duration: Number(duration) || 0,
      content,
      uploadStatus: uploadStatus || 'ready',
      order: existingCount + 1,
    });

    res.status(201).json(lesson);
  } catch (err) { next(err); }
});

// PUT /api/instructor/lessons/:id — update or replace lesson content
router.put('/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    res.json(lesson);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/lessons/:id — delete lesson
router.delete('/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    res.json({ message: 'Lesson deleted successfully.' });
  } catch (err) { next(err); }
});

// ─── REORDERING ─────────────────────────────────────────

// PUT /api/instructor/courses/:id/reorder — bulk reorder modules and lessons
router.put('/courses/:id/reorder', async (req, res, next) => {
  try {
    const { modules } = req.body; // Array of { id, order, lessons: [{ id, order }] }
    if (!Array.isArray(modules)) return res.status(400).json({ message: 'Invalid payload.' });

    const modulePromises = modules.map((m, mIdx) => {
      const updateMod = Module.findByIdAndUpdate(m.id, { $set: { order: mIdx + 1 } });
      const lessonPromises = (m.lessons || []).map((l, lIdx) =>
        Lesson.findByIdAndUpdate(l.id, { $set: { order: lIdx + 1, moduleId: m.id } })
      );
      return Promise.all([updateMod, ...lessonPromises]);
    });

    await Promise.all(modulePromises);
    res.json({ success: true, message: 'Curriculum structure saved.' });
  } catch (err) { next(err); }
});

// ─── COURSE ANALYTICS & STUDENTS ────────────────────────

// GET /api/instructor/courses/:id/analytics — real student engagement metrics
router.get('/courses/:id/analytics', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const modules = await Module.find({ courseId: course._id }).sort('order').lean();
    const moduleIds = modules.map(m => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort('order').lean();
    const enrollments = await Enrollment.find({ courseId: course._id }).populate('userId', 'name email').lean();

    const totalEnrollments = enrollments.length;
    const completedStudents = enrollments.filter(e => e.progress === 100).length;
    const activeStudents = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const avgProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;
    const completionRate = totalEnrollments > 0 ? Math.round((completedStudents / totalEnrollments) * 100) : 0;

    // Lesson-by-lesson completion breakdown
    const lessonBreakdown = lessons.map(lesson => {
      const completedCount = enrollments.filter(e =>
        (e.completedLessons || []).some(id => id.toString() === lesson._id.toString())
      ).length;
      return {
        lessonId: lesson._id,
        title: lesson.title,
        type: lesson.type,
        completedCount,
        completionRate: totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0,
      };
    });

    res.json({
      courseTitle: course.title,
      courseType: course.courseType,
      status: course.status,
      totalEnrollments,
      activeStudents,
      completedStudents,
      avgProgress,
      completionRate,
      totalModules: modules.length,
      totalLessons: lessons.length,
      lessonBreakdown,
    });
  } catch (err) { next(err); }
});

// GET /api/instructor/courses/:id/students — list enrolled students with real progress
router.get('/courses/:id/students', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const enrollments = await Enrollment.find({ courseId: course._id })
      .populate('userId', 'name email role avatar')
      .populate('lastAccessedLesson', 'title type')
      .sort('-updatedAt')
      .lean();

    const students = enrollments.map(e => ({
      enrollmentId: e._id,
      studentId: e.userId?._id,
      name: e.userId?.name || 'Enrolled Student',
      email: e.userId?.email || 'student@example.com',
      progress: e.progress || 0,
      status: e.status || 'active',
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      lastAccessedLesson: e.lastAccessedLesson ? e.lastAccessedLesson.title : 'Not started',
    }));

    res.json(students);
  } catch (err) { next(err); }
});

export default router;
