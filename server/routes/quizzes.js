import express from 'express';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import MasteryScore from '../models/MasteryScore.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import { protect } from '../middleware/auth.js';
import { computeNextAction } from './mastery.js';

const router = express.Router();

// GET /api/quizzes/:id — questions without correctIndex exposed
router.get('/:id', protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    // Strip correctIndex from client response
    const safeQuestions = quiz.questions.map(({ correctIndex, ...rest }) => rest);
    res.json({ ...quiz, questions: safeQuestions });
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers array must match question count.' });
    }

    // Score the quiz
    let correct = 0;
    const questionResults = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { topic: q.topic, isCorrect, correctIndex: q.correctIndex, yourAnswer: answers[i] };
    });
    const score = Math.round((correct / quiz.questions.length) * 100);

    // Save attempt
    await QuizAttempt.create({ userId: req.user.id, quizId: quiz._id, answers, score });

    // Calculate per-topic quiz scores
    const topicMap = {};
    quiz.questions.forEach((q, i) => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (answers[i] === q.correctIndex) topicMap[q.topic].correct++;
    });

    // Get lesson completion % for this module
    const allLessons = await Lesson.find({ moduleId: quiz.moduleId }).lean();
    const enrollment = await Enrollment.findOne({ userId: req.user.id }).lean();
    const completedIds = enrollment?.completedLessons?.map(String) || [];
    const completedInModule = allLessons.filter((l) => completedIds.includes(String(l._id)));
    const completionPct = allLessons.length > 0 ? (completedInModule.length / allLessons.length) * 100 : 0;

    // Update mastery: Mastery = (quizScore × 0.6) + (completionPct × 0.4)
    const updatedTopics = [];
    for (const [topic, data] of Object.entries(topicMap)) {
      const topicQuizScore = Math.round((data.correct / data.total) * 100);
      const newMastery = Math.round(topicQuizScore * 0.6 + completionPct * 0.4);
      await MasteryScore.findOneAndUpdate(
        { userId: req.user.id, topic },
        { score: Math.min(100, newMastery), lastUpdated: new Date() },
        { upsert: true, new: true }
      );
      updatedTopics.push({ topic, score: Math.min(100, newMastery) });
    }

    const allMastery = await MasteryScore.find({ userId: req.user.id }).lean();
    const nextAction = await computeNextAction(req.user.id);

    res.json({
      score,
      correct,
      total: quiz.questions.length,
      questionResults,
      mastery: allMastery,
      updatedTopics,
      nextAction,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
