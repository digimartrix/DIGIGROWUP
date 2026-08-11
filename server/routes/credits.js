import express from 'express';
import CreditTransaction from '../models/CreditTransaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/credits/history - Get transaction logs
router.get('/history', protect, async (req, res, next) => {
  try {
    const transactions = await CreditTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: transactions });
  } catch (err) { next(err); }
});

// GET /api/credits/balance - Get current balance
router.get('/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('creditsBalance').lean();
    res.json({ success: true, balance: user?.creditsBalance || 0 });
  } catch (err) { next(err); }
});

// POST /api/credits/reward - Reward credits dynamically for passing code arena challenges
router.post('/reward', protect, async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || !reason) {
      return res.status(400).json({ success: false, message: 'Amount and reason are required.' });
    }

    const user = await User.findById(req.user.id);
    user.creditsBalance += Number(amount);
    
    // Earn career readiness score boost
    user.careerReadinessScore = Math.min(100, user.careerReadinessScore + 3);
    await user.save();

    await CreditTransaction.create({
      userId: req.user.id,
      type: 'EARN',
      amount: Number(amount),
      reason
    });

    res.json({ success: true, message: 'Credits rewarded successfully.', creditsBalance: user.creditsBalance });
  } catch (err) { next(err); }
});

export default router;
