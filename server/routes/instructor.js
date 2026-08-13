import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
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

// ─── COURSES ───────────────────────────────────────────

// GET /api/instructor/courses — list courses by this instructor
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id }).sort('-createdAt').lean();
    // Attach module count per course
    const enriched = await Promise.all(courses.map(async (c) => {
      const moduleCount = await Module.countDocuments({ courseId: c._id });
      const lessonCount = await Lesson.countDocuments({ moduleId: { $in: (await Module.find({ courseId: c._id }).select('_id').lean()).map(m => m._id) } });
      return { ...c, moduleCount, lessonCount };
    }));
    res.json(enriched);
  } catch (err) { next(err); }
});

// POST /api/instructor/courses — create a new course
router.post('/courses', async (req, res, next) => {
  try {
    const { title, description, category, difficulty, estimatedHours, creditsCost } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' });

    const course = await Course.create({
      title,
      description,
      category: category || 'General',
      difficulty: difficulty || 'Beginner',
      estimatedHours: estimatedHours || 0,
      creditsCost: creditsCost !== undefined ? Number(creditsCost) : 50,
      createdBy: req.user.id,
    });

    await logActivity(req.user, 'COURSE_CREATED', title, { creditsCost: course.creditsCost });
    res.status(201).json(course);
  } catch (err) { next(err); }
});

// PUT /api/instructor/courses/:id — update a course
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
      Course.deleteOne({ _id: course._id }),
    ]);

    await logActivity(req.user, 'COURSE_DELETED', course.title);
    res.json({ message: 'Course and all content deleted.' });
  } catch (err) { next(err); }
});

// ─── MODULES ───────────────────────────────────────────

// POST /api/instructor/courses/:id/modules — add module
router.post('/courses/:id/modules', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const count = await Module.countDocuments({ courseId: course._id });
    const mod = await Module.create({
      title: req.body.title || 'New Module',
      courseId: course._id,
      order: count + 1,
    });

    await logActivity(req.user, 'MODULE_CREATED', mod.title, { courseTitle: course.title });
    res.status(201).json(mod);
  } catch (err) { next(err); }
});

// PUT /api/instructor/courses/:id/modules/:mid — update module
router.put('/courses/:id/modules/:mid', async (req, res, next) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.mid, { $set: req.body }, { new: true });
    if (!mod) return res.status(404).json({ message: 'Module not found.' });
    await logActivity(req.user, 'MODULE_UPDATED', mod.title);
    res.json(mod);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/courses/:id/modules/:mid — delete module + children
router.delete('/courses/:id/modules/:mid', async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.mid);
    if (!mod) return res.status(404).json({ message: 'Module not found.' });

    await Promise.all([
      Lesson.deleteMany({ moduleId: mod._id }),
      Quiz.deleteMany({ moduleId: mod._id }),
      Module.deleteOne({ _id: mod._id }),
    ]);

    await logActivity(req.user, 'MODULE_DELETED', mod.title);
    res.json({ message: 'Module deleted.' });
  } catch (err) { next(err); }
});

// ─── LESSONS ───────────────────────────────────────────

// POST /api/instructor/modules/:mid/lessons — add lesson
router.post('/modules/:mid/lessons', async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.mid);
    if (!mod) return res.status(404).json({ message: 'Module not found.' });

    const count = await Lesson.countDocuments({ moduleId: mod._id });
    const lesson = await Lesson.create({
      title: req.body.title || 'New Lesson',
      moduleId: mod._id,
      content: req.body.content || '# New Lesson\n\nStart writing your lesson content here...',
      order: count + 1,
    });

    await logActivity(req.user, 'LESSON_CREATED', lesson.title, { moduleTitle: mod.title });
    res.status(201).json(lesson);
  } catch (err) { next(err); }
});

// PUT /api/instructor/modules/:mid/lessons/:lid — update lesson
router.put('/modules/:mid/lessons/:lid', async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.lid, { $set: req.body }, { new: true });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    await logActivity(req.user, 'LESSON_UPDATED', lesson.title);
    res.json(lesson);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/modules/:mid/lessons/:lid — delete lesson
router.delete('/modules/:mid/lessons/:lid', async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lid);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    await Lesson.deleteOne({ _id: lesson._id });
    await logActivity(req.user, 'LESSON_DELETED', lesson.title);
    res.json({ message: 'Lesson deleted.' });
  } catch (err) { next(err); }
});

// ─── QUIZZES ───────────────────────────────────────────

// POST /api/instructor/modules/:mid/quiz — create or replace quiz
router.post('/modules/:mid/quiz', async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.mid);
    if (!mod) return res.status(404).json({ message: 'Module not found.' });

    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required.' });
    }

    // Upsert: delete old quiz if exists, create new
    await Quiz.deleteMany({ moduleId: mod._id });
    const quiz = await Quiz.create({ moduleId: mod._id, questions });

    await logActivity(req.user, 'QUIZ_CREATED', `Quiz for ${mod.title}`, { questionCount: questions.length });
    res.status(201).json(quiz);
  } catch (err) { next(err); }
});

// ─── LIVE EVENTS & WORKSHOPS ───────────────────────────

// GET /api/instructor/events — list all events
router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find({}).sort('-createdAt').lean();
    res.json(events);
  } catch (err) { next(err); }
});

// POST /api/instructor/events — create live event
router.post('/events', async (req, res, next) => {
  try {
    const { title, description, date, time, mentor, capacity, type, creditsCost } = req.body;
    if (!title || !description || !date || !time) {
      return res.status(400).json({ message: 'Title, description, date, and time are required.' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      mentor: mentor || req.user.name,
      capacity: Number(capacity) || 50,
      type: type || 'Workshop',
      creditsCost: Number(creditsCost) || 0,
    });

    await logActivity(req.user, 'EVENT_CREATED', title);
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/events/:id — delete event
router.delete('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    await logActivity(req.user, 'EVENT_DELETED', event.title);
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) { next(err); }
});

// ─── EDUCATIONAL RESOURCES ──────────────────────────────

// GET /api/instructor/resources — list all resources
router.get('/resources', async (req, res, next) => {
  try {
    const resources = await Resource.find({}).sort('-createdAt').lean();
    res.json(resources);
  } catch (err) { next(err); }
});

// POST /api/instructor/resources — publish resource
router.post('/resources', async (req, res, next) => {
  try {
    const { title, description, type, downloadUrl, creditsCost } = req.body;
    if (!title) return res.status(400).json({ message: 'Resource title is required.' });

    const resource = await Resource.create({
      title,
      description: description || '',
      type: type || 'Cheatsheet',
      downloadUrl: downloadUrl || '',
      creditsCost: Number(creditsCost) || 0,
    });

    await logActivity(req.user, 'RESOURCE_PUBLISHED', title, { creditsCost: resource.creditsCost });
    res.status(201).json(resource);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/resources/:id — delete resource
router.delete('/resources/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    await logActivity(req.user, 'RESOURCE_DELETED', resource.title);
    res.json({ message: 'Resource deleted successfully.' });
  } catch (err) { next(err); }
});

// ─── BUILD LAB PROJECTS ─────────────────────────────────

// GET /api/instructor/projects — list all projects
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort('-createdAt').lean();
    res.json(projects);
  } catch (err) { next(err); }
});

// POST /api/instructor/projects — create project
router.post('/projects', async (req, res, next) => {
  try {
    const { title, problemStatement, difficulty, requiredSkills, technology, milestones } = req.body;
    if (!title || !problemStatement) {
      return res.status(400).json({ message: 'Title and problem statement are required.' });
    }

    const project = await Project.create({
      title,
      problemStatement,
      difficulty: difficulty || 'Beginner',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      technology: Array.isArray(technology) ? technology : (technology ? technology.split(',').map(s => s.trim()) : []),
      milestones: Array.isArray(milestones) && milestones.length > 0 ? milestones : [
        { title: 'Project Initialization & Architecture Setup', description: 'Configure project repositories and base dependencies.', order: 1 },
        { title: 'Core Implementation & State Logic', description: 'Build foundational components and data logic.', order: 2 },
        { title: 'Production Deployment & Verification', description: 'Deploy live build and test edge cases.', order: 3 }
      ]
    });

    await logActivity(req.user, 'PROJECT_CREATED', title);
    res.status(201).json(project);
  } catch (err) { next(err); }
});

// DELETE /api/instructor/projects/:id — delete project
router.delete('/projects/:id', async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await logActivity(req.user, 'PROJECT_DELETED', project.title);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) { next(err); }
});

export default router;
