import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  percentage: { type: Number, default: 0, min: 0, max: 100 }, // Playback or read percentage
  lastPosition: { type: Number, default: 0 }, // Playback position in seconds for video
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

lessonProgressSchema.index({ studentId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('LessonProgress', lessonProgressSchema);
