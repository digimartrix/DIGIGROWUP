import express from 'express';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/achievements - Get list with unlock state
router.get('/', protect, async (req, res, next) => {
  try {
    const all = await Achievement.find({}).lean();
    const unlocked = await UserAchievement.find({ userId: req.user.id }).lean();
    const unlockedIds = new Set(unlocked.map(u => String(u.achievementId)));

    const enriched = all.map(a => ({
      ...a,
      unlocked: unlockedIds.has(String(a._id))
    }));

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
});

export default router;
