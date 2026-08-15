import express from 'express';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import LessonProgress from '../models/LessonProgress.js';
import MasteryScore from '../models/MasteryScore.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { computeNextAction } from './mastery.js';

const router = express.Router();

// GET /api/lessons/:id — get lesson details with course tree & navigation
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const currentModule = await Module.findById(lesson.moduleId).lean();
    const courseId = lesson.courseId || currentModule?.courseId;
    const course = courseId ? await Course.findById(courseId).lean() : null;

    // Fetch all modules and lessons in this course for sidebar navigation
    const allModules = courseId ? await Module.find({ courseId }).sort('order').lean() : [];
    const modulesWithLessons = await Promise.all(
      allModules.map(async (m) => {
        const lessons = await Lesson.find({ moduleId: m._id }).sort('order').lean();
        const quiz = await Quiz.findOne({ moduleId: m._id }).lean();
        return { ...m, lessons, quizId: quiz?._id || null };
      })
    );

    // Flatten all lessons in order to determine next/previous
    const flatLessons = modulesWithLessons.flatMap(m => m.lessons);
    const currentIndex = flatLessons.findIndex(l => l._id.toString() === lesson._id.toString());
    const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

    // Fetch user enrollment and progress
    const enrollment = courseId ? await Enrollment.findOne({ userId: req.user.id, courseId }).lean() : null;
    const completedList = (enrollment?.completedLessons || []).map(String);
    const isCompleted = completedList.includes(String(lesson._id));

    const progressDoc = await LessonProgress.findOne({
      studentId: req.user.id,
      lessonId: lesson._id,
    }).lean();

    // Update last accessed lesson in Enrollment
    if (courseId && enrollment) {
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        lastAccessedLesson: lesson._id,
      });
      await User.findByIdAndUpdate(req.user.id, { activeCourseId: courseId });
    }

    const quiz = currentModule ? await Quiz.findOne({ moduleId: currentModule._id }).lean() : null;

    res.json({
      ...lesson,
      courseId: course?._id || null,
      courseTitle: course?.title || 'Learning Course',
      courseType: course?.courseType || lesson.type || 'video',
      moduleTitle: currentModule?.title || '',
      modules: modulesWithLessons,
      quizId: quiz?._id || null,
      isCompleted,
      completedLessons: completedList,
      lastPosition: progressDoc?.lastPosition || 0,
      percentage: progressDoc?.percentage || (isCompleted ? 100 : 0),
      prevLesson: prevLesson ? { _id: prevLesson._id, title: prevLesson.title } : null,
      nextLesson: nextLesson ? { _id: nextLesson._id, title: nextLesson.title } : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/lessons/:id/complete — mark lesson complete manually
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const currentModule = await Module.findById(lesson.moduleId).lean();
    const courseId = lesson.courseId || currentModule?.courseId;

    let enrollment = courseId
      ? await Enrollment.findOne({ userId: req.user.id, courseId })
      : await Enrollment.findOne({ userId: req.user.id });

    if (!enrollment && courseId) {
      enrollment = await Enrollment.create({
        userId: req.user.id,
        studentId: req.user.id,
        courseId,
        progress: 0,
        completedLessons: [],
        lastAccessedLesson: lesson._id,
      });
    }

    if (enrollment) {
      const alreadyCompleted = enrollment.completedLessons.some(
        id => id.toString() === lesson._id.toString()
      );
      if (!alreadyCompleted) {
        enrollment.completedLessons.push(lesson._id);
      }

      // Dynamic progress calculation
      const allModules = courseId ? await Module.find({ courseId }).select('_id').lean() : [];
      const totalLessons = await Lesson.countDocuments({ moduleId: { $in: allModules.map(m => m._id) } });
      const progressPct = totalLessons > 0 ? Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100)) : 100;

      enrollment.progress = progressPct;
      enrollment.lastAccessedLesson = lesson._id;
      if (progressPct === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = enrollment.completedAt || new Date();
      }
      await enrollment.save();
    }

    // Upsert LessonProgress
    await LessonProgress.findOneAndUpdate(
      { studentId: req.user.id, lessonId: lesson._id },
      {
        $set: {
          courseId,
          percentage: 100,
          completed: true,
          status: 'completed',
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Recalculate mastery for quiz topics if applicable
    const quiz = currentModule ? await Quiz.findOne({ moduleId: currentModule._id }).lean() : null;
    if (quiz && enrollment) {
      const allLessons = await Lesson.find({ moduleId: currentModule._id }).lean();
      const completedInModule = allLessons.filter((l) =>
        enrollment.completedLessons.map(String).includes(String(l._id))
      );
      const completionPct = (completedInModule.length / allLessons.length) * 100;

      const topics = [...new Set(quiz.questions.map((q) => q.topic))];
      for (const topic of topics) {
        const existing = await MasteryScore.findOne({ userId: req.user.id, topic }).lean();
        const quizScore = existing?.score ?? 0;
        const newScore = Math.round(quizScore * 0.6 + completionPct * 0.4);
        await MasteryScore.findOneAndUpdate(
          { userId: req.user.id, topic },
          { score: Math.min(100, newScore), lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      }
    }

    const updatedMastery = await MasteryScore.find({ userId: req.user.id }).lean();
    const nextAction = await computeNextAction(req.user.id);

    res.json({
      success: true,
      message: 'Lesson completed successfully!',
      progress: enrollment?.progress || 100,
      completedLessons: enrollment?.completedLessons || [],
      mastery: updatedMastery,
      nextAction,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
