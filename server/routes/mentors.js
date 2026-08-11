import express from 'express';
import Mentor from '../models/Mentor.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/mentors - get list of all mentors
router.get('/', protect, async (req, res, next) => {
  try {
    const mentors = await Mentor.find({}).lean();
    res.json({ success: true, data: mentors });
  } catch (err) { next(err); }
});

// GET /api/mentors/requests - get student requests
router.get('/requests', protect, async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user.id })
      .populate('mentorId', 'name photo expertise')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});

// POST /api/mentors/:id/book - book a slot
router.post('/:id/book', protect, async (req, res, next) => {
  try {
    const mentorId = req.params.id;
    const { topic, description, slot } = req.body;

    if (!topic || !slot) {
      return res.status(400).json({ success: false, message: 'Topic and slot are required.' });
    }

    const mentorExists = await Mentor.findById(mentorId);
    if (!mentorExists) {
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }

    const booking = await MentorshipRequest.create({
      studentId: req.user.id,
      mentorId,
      topic,
      description,
      slot,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Session booked successfully.', data: booking });
  } catch (err) { next(err); }
});

export default router;
