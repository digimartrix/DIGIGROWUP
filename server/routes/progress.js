import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import LessonProgress from '../models/LessonProgress.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All progress routes require authentication
router.use(protect);

// POST /api/progress/lesson — record playback position, watch percentage, and completion
router.post('/lesson', async (req, res, next) => {
  try {
    const { courseId, lessonId, percentage = 0, lastPosition = 0, completed = false } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ message: 'courseId and lessonId are required.' });
    }

    const userId = req.user.id;

    // 1. Fetch or create enrollment
    let enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId,
        studentId: userId,
        courseId,
        progress: 0,
        completedLessons: [],
        lastAccessedLesson: lessonId,
      });
      // Increment course enrollmentCount
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    }

    // 2. Count total lessons in course
    const modules = await Module.find({ courseId }).select('_id').lean();
    const moduleIds = modules.map(m => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });

    // Determine completion (auto-complete at >= 90% or manual trigger)
    const isCompleted = completed || percentage >= 90;

    // 3. Upsert LessonProgress
    const progressDoc = await LessonProgress.findOneAndUpdate(
      { studentId: userId, courseId, lessonId },
      {
        $set: {
          percentage: Math.min(100, Math.max(0, Math.round(percentage))),
          lastPosition: Number(lastPosition) || 0,
          completed: isCompleted,
          status: isCompleted ? 'completed' : 'in_progress',
          lastAccessedAt: new Date(),
          ...(isCompleted ? { completedAt: new Date() } : {}),
        },
      },
      { upsert: true, new: true }
    );

    // 4. Update Enrollment record if completed
    let isNewlyCompleted = false;
    if (isCompleted) {
      const alreadyCompleted = enrollment.completedLessons.some(
        id => id.toString() === lessonId.toString()
      );
      if (!alreadyCompleted) {
        enrollment.completedLessons.push(lessonId);
        isNewlyCompleted = true;
      }
    }

    // Dynamic progress percentage: (completedLessons / totalLessons) * 100
    const completedCount = enrollment.completedLessons.length;
    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    enrollment.progress = progressPct;
    enrollment.lastAccessedLesson = lessonId;
    if (progressPct === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = enrollment.completedAt || new Date();
    }
    await enrollment.save();

    // Set as active course for the user
    await User.findByIdAndUpdate(userId, { activeCourseId: courseId });

    if (isNewlyCompleted) {
      const lesson = await Lesson.findById(lessonId).select('title').lean();
      try {
        await ActivityLog.create({
          userId,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'LESSON_COMPLETED',
          target: lesson?.title || 'Lesson',
          metadata: { courseId, lessonId, progressPct },
        });
      } catch (e) {
        console.error('[LOG]', e.message);
      }
    }

    res.json({
      success: true,
      lessonProgress: progressDoc,
      courseProgress: progressPct,
      completedLessons: enrollment.completedLessons,
      completedCount,
      totalLessons,
      isCourseCompleted: progressPct === 100,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/progress/:courseId — get detailed progress for current user in course
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const [enrollment, progressList] = await Promise.all([
      Enrollment.findOne({ userId, courseId }).lean(),
      LessonProgress.find({ studentId: userId, courseId }).lean(),
    ]);

    res.json({
      enrollment,
      progress: enrollment?.progress || 0,
      completedLessons: enrollment?.completedLessons || [],
      lastAccessedLesson: enrollment?.lastAccessedLesson || null,
      lessonProgresses: progressList,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
