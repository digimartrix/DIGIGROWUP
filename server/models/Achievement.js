import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  badgeIcon: { type: String, default: '' }, // e.g. "Trophy", "Award"
  criteriaType: { type: String, required: true }, // e.g. "streak", "quiz_score", "course_complete"
  criteriaValue: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
