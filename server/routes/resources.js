import express from 'express';
import Resource from '../models/Resource.js';
import ResourceUnlock from '../models/ResourceUnlock.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/resources - Get resource items and checks
router.get('/', protect, async (req, res, next) => {
  try {
    const resources = await Resource.find({}).sort({ creditsCost: 1 }).lean();
    const unlocks = await ResourceUnlock.find({ userId: req.user.id }).lean();
    const unlockedIds = new Set(unlocks.map(u => String(u.resourceId)));

    const enriched = resources.map(r => ({
      ...r,
      unlocked: r.creditsCost === 0 || unlockedIds.has(String(r._id))
    }));

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
});

// POST /api/resources/:id/unlock - Buy/unlock a paid resource with credits
router.post('/:id/unlock', protect, async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource item not found.' });

    // Check if already unlocked
    const existing = await ResourceUnlock.findOne({ userId: req.user.id, resourceId }).lean();
    if (existing) return res.status(400).json({ success: false, message: 'You have already unlocked this resource.' });

    const user = await User.findById(req.user.id);
    if (user.creditsBalance < resource.creditsCost) {
      return res.status(400).json({ success: false, message: 'Insufficient virtual credits balance.' });
    }

    // Deduct credits and save
    user.creditsBalance -= resource.creditsCost;
    await user.save();

    // Log transaction
    await CreditTransaction.create({
      userId: req.user.id,
      type: 'SPEND',
      amount: resource.creditsCost,
      reason: `Unlocked premium resource: ${resource.title}`,
      referenceId: resource._id
    });

    // Create unlock record
    await ResourceUnlock.create({ userId: req.user.id, resourceId });

    // Push notification
    await Notification.create({
      userId: req.user.id,
      message: `Successfully unlocked premium resource: ${resource.title}. Download link is now active.`,
      type: 'reward'
    });

    res.json({ success: true, message: 'Resource unlocked successfully.', creditsBalance: user.creditsBalance });
  } catch (err) { next(err); }
});

export default router;
