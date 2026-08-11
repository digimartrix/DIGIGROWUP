import express from 'express';
import MasteryScore from '../models/MasteryScore.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Shared helper — derive next best action from mastery data
export async function computeNextAction(userId) {
  const scores = await MasteryScore.find({ userId }).lean();
  if (!scores.length) return null;

  // Find the weakest topic
  const weakest = scores.reduce((a, b) => (a.score < b.score ? a : b));

  // Find which quiz/lesson this topic belongs to
  const allQuizzes = await Quiz.find({}).lean();
  let targetQuiz = null;
  let targetLesson = null;

  for (const quiz of allQuizzes) {
    const topicMatch = quiz.questions.find((q) => q.topic === weakest.topic);
    if (topicMatch) {
      targetQuiz = quiz;
      // Find first lesson in this module
      const lessons = await Lesson.find({ moduleId: quiz.moduleId }).sort('order').lean();
      targetLesson = lessons[0] || null;
      break;
    }
  }

  // Estimate reading time: word count ÷ 200, rounded to nearest 5 min
  let estTime = null;
  if (targetLesson?.wordCount) {
    const raw = targetLesson.wordCount / 200;
    estTime = Math.round(raw / 5) * 5 || 5;
  }

  const score = weakest.score;
  let action, deepLink, cta;

  if (score < 40) {
    action = 'CRITICAL';
    cta = `Your ${weakest.topic} mastery is CRITICAL. Review the lesson${estTime ? ` (~${estTime} min)` : ''}.`;
    deepLink = targetLesson ? `/lesson/${targetLesson._id}` : null;
  } else if (score < 70) {
    action = 'PRACTICE';
    cta = `Your ${weakest.topic} mastery needs work. Practice with the quiz${estTime ? ` (~${estTime} min)` : ''}.`;
    deepLink = targetQuiz ? `/quiz/${targetQuiz._id}` : null;
  } else if (score < 90) {
    action = 'ASSESS';
    cta = `Take the assessment on ${weakest.topic} to reach PROFICIENT.`;
    deepLink = targetQuiz ? `/quiz/${targetQuiz._id}` : null;
  } else {
    action = 'ADVANCE';
    cta = `${weakest.topic} is MASTERED. Move to the next module.`;
    deepLink = null; // frontend can find next module
  }

  return { action, cta, topic: weakest.topic, score, deepLink, estTime };
}

// GET /api/mastery/:userId
router.get('/:userId', protect, async (req, res, next) => {
  try {
    if (req.params.userId !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const scores = await MasteryScore.find({ userId: req.user.id }).lean();
    res.json(scores);
  } catch (err) {
    next(err);
  }
});

// GET /api/next-action/:userId
router.get('/next-action/:userId', protect, async (req, res, next) => {
  try {
    if (req.params.userId !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const nextAction = await computeNextAction(req.user.id);
    if (!nextAction) return res.json({ message: 'No mastery data yet — complete a quiz to get started.' });
    res.json(nextAction);
  } catch (err) {
    next(err);
  }
});

export default router;
