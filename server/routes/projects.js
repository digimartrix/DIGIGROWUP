import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', protect, async (req, res, next) => {
  try {
    const list = await Project.find({}).lean();
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

// POST /api/projects/:id/submit - Submit a project milestone or task
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const { repoUrl, demoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ success: false, message: 'Repository URL is required for submission.' });

    // In a real system, we save submission metadata.
    // For now, reward the student with 50 credits!
    const user = await User.findById(req.user.id);
    user.creditsBalance += 50;
    
    // Earn career readiness score boost
    user.careerReadinessScore = Math.min(100, user.careerReadinessScore + 10);
    await user.save();

    // Log transaction
    await CreditTransaction.create({
      userId: req.user.id,
      type: 'EARN',
      amount: 50,
      reason: `Submitted build project: ${project.title}`
    });

    // Push notification
    await Notification.create({
      userId: req.user.id,
      message: `Project "${project.title}" submitted successfully! You earned +50 credits and increased your career readiness score.`,
      type: 'reward'
    });

    res.json({
      success: true,
      message: 'Project submitted successfully!',
      creditsBalance: user.creditsBalance,
      careerReadinessScore: user.careerReadinessScore
    });
  } catch (err) { next(err); }
});

export default router;
