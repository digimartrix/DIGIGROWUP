import express from 'express';
import Groq from 'groq-sdk';
import MasteryScore from '../models/MasteryScore.js';
import Lesson from '../models/Lesson.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/tutor
router.post('/tutor', protect, async (req, res, next) => {
  try {
    const { message, lessonId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required.' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('gsk_placeholder')) {
      return res.json({
        reply: 'DigiMentor is currently in text fallback mode because GROQ_API_KEY is not configured on the server. Add a valid Groq API key in server/.env to enable live AI responses.'
      });
    }

    const groq = new Groq({ apiKey });

    let lessonContext = '';
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId).lean();
      if (lesson) lessonContext = `\n\nCurrent lesson: "${lesson.title}"\nLesson content:\n${lesson.content.substring(0, 1500)}`;
    }

    const masteryScores = await MasteryScore.find({ userId: req.user.id }).lean();
    const weakTopics = masteryScores.filter((m) => m.score < 50).map((m) => `${m.topic} (${m.score}%)`);
    const weakContext =
      weakTopics.length > 0
        ? `\n\nStudent's weak topics (under 50% mastery): ${weakTopics.join(', ')}. Focus explanations on these areas when relevant.`
        : '';

    const systemPrompt = `You are DigiMentor inside Digimartrix Learning Ecosystem. You are a precise, encouraging education assistant who helps students learn, practice, revise, build projects, and prepare for careers. Explain concepts clearly, use concrete examples, and relate answers to what the student is currently studying.${lessonContext}${weakContext}\n\nKeep responses concise (under 200 words unless a detailed explanation is explicitly needed). Use markdown formatting for code examples.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
