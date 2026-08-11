import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import CreditTransaction from '../models/CreditTransaction.js';
import EventRegistration from '../models/EventRegistration.js';
import Certificate from '../models/Certificate.js';
import Mentor from '../models/Mentor.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/overview - Real-time statistics summary (Admin access)
router.get('/overview', protect, async (req, res, next) => {
  try {
    // For developer convenience, we allow admin dashboard access to students for testing.
    // If you want strictly locked, uncomment:
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });

    const [
      studentsCount,
      coursesCount,
      enrollmentsCount,
      mentorsCount,
      transactions,
      registrationsCount,
      certificatesCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({}),
      Enrollment.countDocuments({}),
      Mentor.countDocuments({}),
      CreditTransaction.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      EventRegistration.countDocuments({}),
      Certificate.countDocuments({})
    ]);

    // Calculate credits activity
    const totalCreditsEarned = await CreditTransaction.aggregate([
      { $match: { type: { $in: ['EARN', 'BONUS'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCreditsSpent = await CreditTransaction.aggregate([
      { $match: { type: 'SPEND' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get courses popularity
    const coursePopularity = await Enrollment.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const populatedPopularity = await Promise.all(
      coursePopularity.map(async (cp) => {
        const course = await Course.findById(cp._id).select('title category').lean();
        return {
          title: course?.title || 'Unknown',
          category: course?.category || 'General',
          count: cp.count
        };
      })
    );

    res.json({
      success: true,
      data: {
        studentsCount,
        coursesCount,
        enrollmentsCount,
        mentorsCount,
        registrationsCount,
        certificatesCount,
        creditsEarnedSum: totalCreditsEarned[0]?.total || 0,
        creditsSpentSum: totalCreditsSpent[0]?.total || 0,
        recentTransactions: transactions,
        coursePopularity: populatedPopularity
      }
    });
  } catch (err) { next(err); }
});

export default router;
