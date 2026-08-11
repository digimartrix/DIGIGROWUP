import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor', 'instructor', 'admin'], default: 'student' },
  activeCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  creditsBalance: { type: Number, default: 245 }, // Seeded credits balance
  careerReadinessScore: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
