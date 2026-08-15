import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
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

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const uploadPdfMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// POST /api/instructor/courses/convert-pdf — AI extraction of PDF into text/markdown course
router.post('/courses/convert-pdf', uploadPdfMemory.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded. Please select a .pdf document.' });
    }

    if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF documents (.pdf) can be processed.' });
    }

    console.log(`[AI PDF] Extracting text from ${req.file.originalname} (${req.file.size} bytes)...`);
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text || '';

    if (!rawText.trim() || rawText.trim().length < 50) {
      return res.status(400).json({
        message: 'Could not extract readable text from this PDF. It may be an image-only scanned document without an OCR text layer.',
      });
    }

    // Clip raw text to ~30,000 characters to fit Groq context window comfortably
    const cleanText = rawText.replace(/\s+/g, ' ').slice(0, 30000);

    const userCategory = req.body.category || 'Software Engineering';
    const userDifficulty = req.body.difficulty || 'Beginner';
    const userTitleOverride = req.body.title || '';

    const prompt = `You are a world-class instructional designer and educational curriculum architect.
Analyze the following extracted content from a PDF document and structure it into a comprehensive, high-quality, multi-module interactive course.

PDF TEXT CONTENT:
"""
${cleanText}
"""

Target Category: ${userCategory}
Target Difficulty: ${userDifficulty}
${userTitleOverride ? `Target Title Override: "${userTitleOverride}"` : ''}

Output strictly valid JSON according to this exact JSON schema:
{
  "title": "Clear, professional, captivating course title",
  "description": "Comprehensive 2-3 sentence course overview summarizing what students will learn and achieve.",
  "category": "${userCategory}",
  "difficulty": "${userDifficulty}",
  "estimatedHours": 8,
  "learningObjectives": [
    "Comprehensive outcome 1",
    "Comprehensive outcome 2",
    "Comprehensive outcome 3",
    "Comprehensive outcome 4"
  ],
  "modules": [
    {
      "title": "Module 1: Module Title",
      "lessons": [
        {
          "title": "Lesson 1.1: Detailed Lesson Title",
          "description": "Clear 1-2 sentence lesson summary",
          "content": "# Lesson Title\\n\\nDetailed comprehensive conceptual breakdown.\\n\\n## Key Principles\\n- Principle 1: Explanation\\n- Principle 2: Explanation\\n\\n\`\`\`javascript\\n// Practical code or implementation example\\nfunction example() {\\n  return true;\\n}\\n\`\`\`\\n\\n## Summary & Key Takeaways\\n- Summary bullet 1\\n- Summary bullet 2"
        }
      ]
    }
  ]
}

Instructions:
1. Divide the PDF material into 2 to 4 structured modules.
2. Inside each module, generate 2 to 4 rich, well-written text lessons with deep instructional value based on the PDF content.
3. Every lesson's "content" MUST be extensive, informative Markdown with proper headers (#, ##), explanations, code blocks where applicable, and key takeaways.
4. Ensure strictly valid JSON with no markdown backticks outside the JSON string.`;

    console.log('[AI PDF] Sending prompt to Groq (llama-3.1-8b-instant)...');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an expert curriculum designer that outputs strictly valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const parsedJson = JSON.parse(completion.choices[0]?.message?.content || '{}');
    console.log('[AI PDF] Generated Course Title:', parsedJson.title);

    // Save Course to MongoDB
    const course = new Course({
      title: userTitleOverride || parsedJson.title || req.file.originalname.replace('.pdf', ''),
      description: parsedJson.description || `Structured interactive course converted from PDF: ${req.file.originalname}`,
      category: parsedJson.category || userCategory,
      difficulty: parsedJson.difficulty || userDifficulty,
      estimatedHours: parsedJson.estimatedHours || 8,
      estimatedDuration: `${parsedJson.estimatedHours || 8} hours`,
      learningObjectives: parsedJson.learningObjectives || [],
      courseType: 'text', // text format interactive course
      status: 'draft',
      createdBy: req.user.id,
      instructorId: req.user.id,
    });
    await course.save();

    let totalLessonsCount = 0;
    const modulesToCreate = parsedJson.modules && parsedJson.modules.length > 0
      ? parsedJson.modules
      : [{ title: 'Module 1: Core Concepts', lessons: [{ title: 'Chapter 1', description: 'Overview', content: cleanText.slice(0, 2000) }] }];

    for (let mIdx = 0; mIdx < modulesToCreate.length; mIdx++) {
      const mData = modulesToCreate[mIdx];
      const newModule = new Module({
        courseId: course._id,
        title: mData.title || `Module ${mIdx + 1}`,
        order: mIdx + 1,
      });
      await newModule.save();

      const lessonsToCreate = mData.lessons || [];
      for (let lIdx = 0; lIdx < lessonsToCreate.length; lIdx++) {
        const lData = lessonsToCreate[lIdx];
        const contentStr = lData.content || `# ${lData.title || 'Lesson'}\n\n${lData.description || 'Lesson content'}`;
        const wordCount = contentStr.trim().split(/\s+/).length;
        const estDurationSec = Math.max(300, Math.round((wordCount / 200) * 60)); // ~200 wpm

        const newLesson = new Lesson({
          courseId: course._id,
          moduleId: newModule._id,
          title: lData.title || `Lesson ${lIdx + 1}`,
          description: lData.description || '',
          type: 'text',
          content: contentStr,
          duration: estDurationSec,
          wordCount,
          order: lIdx + 1,
          uploadStatus: 'ready',
        });
        await newLesson.save();
        totalLessonsCount++;
      }
    }

    await logActivity(req.user, 'COURSE_PDF_CONVERTED', `Course: ${course.title}`, {
      courseId: course._id,
      pdfFileName: req.file.originalname,
      modulesCount: modulesToCreate.length,
      lessonsCount: totalLessonsCount,
    });

    res.json({
      success: true,
      message: `🎉 PDF converted successfully into ${modulesToCreate.length} modules and ${totalLessonsCount} text lessons!`,
      courseId: course._id,
      course,
      modulesCount: modulesToCreate.length,
      lessonsCount: totalLessonsCount,
    });
  } catch (err) {
    console.error('[AI PDF] Conversion Error:', err);
    res.status(500).json({
      message: err.message || 'Failed to convert PDF into text course. Please check if the PDF contains readable text.',
    });
  }
});

export default router;
