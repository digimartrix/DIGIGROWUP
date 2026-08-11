import express from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import MasteryScore from '../models/MasteryScore.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';
import { computeNextAction } from './mastery.js';

const router = express.Router();

const skillNames = [
  'Programming',
  'Web Development',
  'AI/ML',
  'Database',
  'Cloud',
  'DevOps',
  'Communication',
  'Aptitude',
];

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const average = (items, selector = (item) => item) => {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + selector(item), 0) / items.length);
};

const isoDay = (date) => new Date(date).toISOString().slice(0, 10);

function calculateStreak(dates) {
  const days = new Set(dates.filter(Boolean).map(isoDay));
  if (!days.size) return 0;

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = isoDay(cursor);
    if (!days.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildSkillRadar({ mastery, progressPct, assessmentPerformance, course }) {
  const masteryByTopic = new Map(mastery.map((item) => [item.topic.toLowerCase(), item.score]));
  const webTopics = ['html semantics', 'html forms', 'css box model', 'css flexbox', 'css grid'];
  const programmingTopics = ['javascript', 'functions', 'arrays', 'objects', 'async'];

  const webMastery = average(
    webTopics
      .map((topic) => masteryByTopic.get(topic))
      .filter((score) => typeof score === 'number')
  );
  const programmingMastery = average(
    programmingTopics
      .map((topic) => masteryByTopic.get(topic))
      .filter((score) => typeof score === 'number')
  );

  const courseSignal = course?.category === 'Web Development' ? progressPct : Math.round(progressPct * 0.7);
  const base = Math.max(12, Math.round((progressPct + assessmentPerformance) / 3));

  return skillNames.map((name) => {
    const scoreMap = {
      Programming: programmingMastery || clamp(base + 8),
      'Web Development': webMastery || clamp(courseSignal + 18),
      'AI/ML': clamp(base * 0.45),
      Database: clamp(base * 0.55),
      Cloud: clamp(base * 0.4),
      DevOps: clamp(base * 0.38),
      Communication: clamp(42 + progressPct * 0.25),
      Aptitude: clamp(36 + assessmentPerformance * 0.28),
    };

    return { name, score: clamp(scoreMap[name]) };
  });
}

function buildNextStep(nextAction, course, firstIncomplete, primaryQuizId) {
  if (nextAction?.topic) {
    return {
      title: nextAction.action === 'CRITICAL' ? `Revise ${nextAction.topic}` : `Practice ${nextAction.topic}`,
      reason: nextAction.cta,
      action: nextAction.action,
      deepLink: nextAction.deepLink || (primaryQuizId ? `/quiz/${primaryQuizId}` : null),
      estTime: nextAction.estTime,
    };
  }

  if (firstIncomplete) {
    return {
      title: firstIncomplete.title,
      reason: `Continue ${course?.title || 'your active course'} to start building topic-level mastery.`,
      action: 'LEARN',
      deepLink: `/lesson/${firstIncomplete._id}`,
      estTime: firstIncomplete.wordCount ? Math.max(5, Math.round(firstIncomplete.wordCount / 200)) : 8,
    };
  }

  return {
    title: 'Open Learning Library',
    reason: 'Your active path is complete. Choose the next skill track to keep growing.',
    action: 'DISCOVER',
    deepLink: '/explore',
    estTime: 5,
  };
}

// GET /api/ecosystem/overview
router.get('/overview', protect, async (req, res, next) => {
  try {
    const [enrollment, courses, mastery, attempts] = await Promise.all([
      Enrollment.findOne({ userId: req.user.id }).lean(),
      Course.find({}).lean(),
      MasteryScore.find({ userId: req.user.id }).sort({ score: 1 }).lean(),
      QuizAttempt.find({ userId: req.user.id }).sort({ submittedAt: -1 }).limit(20).lean(),
    ]);

    let course = null;
    let modules = [];
    let firstIncomplete = null;
    let primaryQuizId = null;
    let completedLessons = [];
    let totalLessons = 0;

    if (enrollment) {
      course = await Course.findById(enrollment.courseId).lean();
      modules = await Module.find({ courseId: enrollment.courseId }).sort('order').lean();
      const completedSet = new Set((enrollment.completedLessons || []).map(String));
      completedLessons = await Lesson.find({ _id: { $in: enrollment.completedLessons || [] } }).lean();

      const modulesWithLessons = await Promise.all(
        modules.map(async (mod) => {
          const [lessons, quiz] = await Promise.all([
            Lesson.find({ moduleId: mod._id }).sort('order').lean(),
            Quiz.findOne({ moduleId: mod._id }).lean(),
          ]);
          if (!primaryQuizId && quiz?._id) primaryQuizId = quiz._id;
          totalLessons += lessons.length;
          if (!firstIncomplete) firstIncomplete = lessons.find((lesson) => !completedSet.has(String(lesson._id))) || null;
          return { ...mod, lessons, quizId: quiz?._id || null };
        })
      );
      modules = modulesWithLessons;
    }

    const completedCount = enrollment?.completedLessons?.length || 0;
    const progressPct = totalLessons ? clamp((completedCount / totalLessons) * 100) : 0;
    const assessmentPerformance = average(attempts, (attempt) => attempt.score);
    const skillMastery = mastery.length ? average(mastery, (item) => item.score) : clamp(progressPct * 0.55 + assessmentPerformance * 0.45);
    const nextAction = await computeNextAction(req.user.id);
    const recommendedNextStep = buildNextStep(nextAction, course, firstIncomplete, primaryQuizId);
    const activityDates = [
      enrollment?.updatedAt,
      ...attempts.map((attempt) => attempt.submittedAt),
      ...completedLessons.map((lesson) => lesson.updatedAt),
    ];
    const currentStreak = calculateStreak(activityDates);
    const weeklyLearningTime = Math.max(0, Math.round((completedCount * 8 + attempts.length * 10) / 60));
    const weakestTopic = mastery[0] || null;
    const creditBalance = completedCount * 25 + attempts.length * 35 + Math.max(0, Math.round(assessmentPerformance / 5));
    const careerReadiness = clamp(skillMastery * 0.35 + progressPct * 0.25 + assessmentPerformance * 0.25 + Math.min(100, completedCount * 8) * 0.15);

    const recentActivity = [
      ...completedLessons.slice(-3).map((lesson) => ({
        title: `Completed lesson: ${lesson.title}`,
        detail: 'Skill Growth updated from lesson progress.',
        type: 'lesson',
      })),
      ...attempts.slice(0, 3).map((attempt) => ({
        title: `Assessment submitted: ${attempt.score}%`,
        detail: 'DigiMentor uses this result to shape revision and practice.',
        type: 'assessment',
      })),
    ].slice(0, 5);

    const activityCenter = [
      recommendedNextStep && {
        title: 'Recommended next step is ready',
        detail: recommendedNextStep.reason,
      },
      weakestTopic && weakestTopic.score < 70 && {
        title: `${weakestTopic.topic} revision is due`,
        detail: `Current skill mastery is ${weakestTopic.score}%. Review before advancing.`,
      },
      {
        title: `${creditBalance} DigiCredits available`,
        detail: 'Spend credits on transparent learning resources, practice packs, and project kits.',
      },
    ].filter(Boolean);

    res.json({
      learner: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      course: course ? { ...course, modules, completedLessons: enrollment?.completedLessons || [] } : null,
      courses,
      primaryQuizId,
      firstIncompleteLessonId: firstIncomplete?._id || null,
      mastery,
      weakestTopic,
      nextAction,
      recommendedNextStep,
      learningHealth: {
        currentStreak,
        weeklyLearningTime,
        skillMastery,
        courseCompletion: progressPct,
        assessmentPerformance,
        projectCompletion: clamp(Math.min(100, completedCount * 12)),
        codingPerformance: clamp(assessmentPerformance * 0.7 + progressPct * 0.3),
      },
      skillRadar: buildSkillRadar({ mastery, progressPct, assessmentPerformance, course }),
      upcoming: [
        { title: 'Mentor Connect review', detail: weakestTopic ? `Focus: ${weakestTopic.topic}` : 'Focus: learning path setup', date: 'This week' },
        { title: 'Live Learning workshop', detail: 'Clean CSS Systems', date: 'Friday' },
        { title: 'Build Lab checkpoint', detail: 'Portfolio-ready project milestone', date: 'Next' },
      ],
      recentActivity,
      activityCenter,
      digiCredits: {
        balance: creditBalance,
        earned: [
          { reason: 'Lesson completion', amount: completedCount * 25 },
          { reason: 'Assessment attempts', amount: attempts.length * 35 },
          { reason: 'Performance bonus', amount: Math.max(0, Math.round(assessmentPerformance / 5)) },
        ],
      },
      achievements: [
        { title: 'Learning Streak Started', type: 'Badge', skill: 'Consistency', credits: 30, description: `${currentStreak || 1} day learning rhythm established.` },
        { title: course?.title || 'Active Learning Path', type: 'Course proof', skill: course?.category || 'Learning', credits: 80, description: `${progressPct}% course completion toward Achievement Vault proof.` },
        { title: 'Assessment Signal', type: 'Assessment proof', skill: 'Skill Mastery', credits: 50, description: attempts.length ? `${attempts.length} assessment attempt${attempts.length > 1 ? 's' : ''} recorded.` : 'Complete an assessment to unlock proof.' },
      ],
      portfolioSignals: [
        { label: 'Career goal', value: 'Full Stack Developer' },
        { label: 'Current path', value: course?.title || 'Choose from Learning Library' },
        { label: 'Strongest signal', value: mastery.at(-1)?.topic || 'Course commitment' },
        { label: 'Next proof target', value: 'Complete one Build Lab project' },
      ],
      profileReadiness: clamp(progressPct * 0.45 + skillMastery * 0.35 + attempts.length * 6),
      careerReadiness,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
