import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // courseId, mentorId, etc.
  targetType: { type: String, enum: ['Course', 'Mentor', 'Project'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
}, { timestamps: true });

reviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
