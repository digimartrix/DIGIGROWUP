import express from 'express';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Enrollment from '../models/Enrollment.js';
import MasteryScore from '../models/MasteryScore.js';
import Quiz from '../models/Quiz.js';
import { protect } from '../middleware/auth.js';
import { computeNextAction } from './mastery.js';

const router = express.Router();

// GET /api/lessons/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId).lean();
    const quiz = mod ? await Quiz.findOne({ moduleId: mod._id }).lean() : null;

    const enrollment = await Enrollment.findOne({ userId: req.user.id }).lean();
    const completed = enrollment?.completedLessons?.map(String) || [];

    res.json({
      ...lesson,
      moduleTitle: mod?.title || '',
      quizId: quiz?._id || null,
      isCompleted: completed.includes(String(lesson._id)),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/lessons/:id/complete
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { completedLessons: lesson._id } },
      { new: true }
    );

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });

    // Recalculate mastery for topics in this lesson's module quiz
    const quiz = await Quiz.findOne({ moduleId: lesson.moduleId }).lean();
    if (quiz) {
      const allLessons = await Lesson.find({ moduleId: lesson.moduleId }).lean();
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

    res.json({ message: 'Lesson marked complete.', mastery: updatedMastery, nextAction });
  } catch (err) {
    next(err);
  }
});

export default router;
