import express from 'express';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events - Retrieve events list and checking if registered
router.get('/', protect, async (req, res, next) => {
  try {
    const events = await Event.find({}).sort({ date: 1 }).lean();
    const registrations = await EventRegistration.find({ userId: req.user.id }).lean();
    const registeredIds = new Set(registrations.map(r => String(r.eventId)));

    const enriched = events.map(e => ({
      ...e,
      registered: registeredIds.has(String(e._id))
    }));

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
});

// POST /api/events/:id/register - Register for a workshop/hackathon
router.post('/:id/register', protect, async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Check duplicate registration
    const existing = await EventRegistration.findOne({ userId: req.user.id, eventId }).lean();
    if (existing) return res.status(400).json({ success: false, message: 'You are already registered for this event.' });

    // Check capacity
    const count = await EventRegistration.countDocuments({ eventId });
    if (count >= event.capacity) {
      return res.status(400).json({ success: false, message: 'This session has reached full capacity.' });
    }

    const user = await User.findById(req.user.id);

    // Charge credits if event has credit cost
    if (event.creditsCost > 0) {
      if (user.creditsBalance < event.creditsCost) {
        return res.status(400).json({ success: false, message: 'Insufficient virtual credits to register.' });
      }

      // Deduct balance and create transaction
      user.creditsBalance -= event.creditsCost;
      await user.save();

      await CreditTransaction.create({
        userId: req.user.id,
        type: 'SPEND',
        amount: event.creditsCost,
        reason: `Registration fee for event: ${event.title}`,
        referenceId: event._id
      });
    }

    // Register event
    await EventRegistration.create({ userId: req.user.id, eventId });

    // Push notification
    await Notification.create({
      userId: req.user.id,
      message: `Registration confirmed for event: ${event.title}. Starts on ${event.date} at ${event.time}.`,
      type: 'system'
    });

    res.json({ success: true, message: 'Successfully registered for event.', creditsBalance: user.creditsBalance });
  } catch (err) { next(err); }
});

export default router;
