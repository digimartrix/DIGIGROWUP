import express from 'express';
import Groq from 'groq-sdk';
import MasteryScore from '../models/MasteryScore.js';
import Lesson from '../models/Lesson.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/tutor — contextual DigiMentor assistant
router.post('/tutor', protect, async (req, res, next) => {
  try {
    const {
      message,
      lessonId,
      courseTitle,
      moduleTitle,
      lessonTitle,
      courseType,
      lessonType,
      lessonContent,
      action,
    } = req.body;

    if (!message?.trim() && !action) {
      return res.status(400).json({ message: 'Message or action is required.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('gsk_placeholder')) {
      return res.json({
        reply: 'DigiMentor is active in demonstration mode. Configure a valid Groq API key in server/.env to enable live llama-3.1 AI reasoning.',
      });
    }

    const groq = new Groq({ apiKey });

    // Build rich context from request or database
    let ctxLessonTitle = lessonTitle || '';
    let ctxModuleTitle = moduleTitle || '';
    let ctxCourseTitle = courseTitle || '';
    let ctxContent = lessonContent || '';

    if (lessonId && (!ctxLessonTitle || !ctxContent)) {
      const lesson = await Lesson.findById(lessonId).populate('moduleId').lean();
      if (lesson) {
        ctxLessonTitle = lesson.title;
        ctxModuleTitle = lesson.moduleId?.title || '';
        ctxContent = lesson.content || lesson.description || '';
      }
    }

    let learningContext = '';
    if (ctxCourseTitle || ctxLessonTitle) {
      learningContext = `\n\n[Active Learning Context]\n- Course: ${ctxCourseTitle || 'General Engineering'}\n- Module/Chapter: ${ctxModuleTitle || 'Current Section'}\n- Lesson: ${ctxLessonTitle || 'Active Topic'}\n- Delivery Format: ${courseType || lessonType || 'Interactive'}`;
      if (ctxContent) {
        learningContext += `\n- Lesson Snippet:\n${ctxContent.substring(0, 1200)}`;
      }
    }

    const masteryScores = await MasteryScore.find({ userId: req.user.id }).lean();
    const weakTopics = masteryScores.filter((m) => m.score < 50).map((m) => `${m.topic} (${m.score}%)`);
    const weakContext =
      weakTopics.length > 0
        ? `\n\nStudent's focus topics (<50% mastery): ${weakTopics.join(', ')}.`
        : '';

    let userPrompt = message || '';
    if (action === 'explain') {
      userPrompt = `Please explain the key concept of "${ctxLessonTitle || 'this lesson'}" step by step in simple, clear language with an illustrative example.`;
    } else if (action === 'summarize') {
      userPrompt = `Summarize the core takeaways and practical insights of "${ctxLessonTitle || 'this lesson'}" into 3-4 bullet points.`;
    } else if (action === 'example') {
      userPrompt = `Provide a real-world code snippet or practical scenario demonstrating how "${ctxLessonTitle || 'this concept'}" is used in professional engineering.`;
    } else if (action === 'quiz') {
      userPrompt = `Generate 2 quick multiple-choice questions with answer choices (A, B, C, D) based on "${ctxLessonTitle || 'this lesson'}" to test my understanding, followed by the correct answer explanations hidden at the end.`;
    }

    const systemPrompt = `You are DigiMentor, the intelligent, friendly, and expert AI tutor in the DigiLearning Ecosystem.
You guide learners through their courses, video lessons, and PDF chapters.
Always relate your answers to the student's current learning context whenever provided.
Provide crisp, clear, inspiring, and technically precise explanations with markdown code blocks where applicable.${learningContext}${weakContext}
Keep responses structured, engaging, and under 250 words unless the student explicitly asks for deeper depth.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I am reviewing your lesson concept. Please ask a follow-up question!';
    res.json({ reply, promptUsed: userPrompt });
  } catch (err) {
    next(err);
  }
});

export default router;
