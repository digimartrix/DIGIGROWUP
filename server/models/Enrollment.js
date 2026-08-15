import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // Calculated dynamically: (completedLessons / totalLessons) * 100
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure studentId syncs with userId
enrollmentSchema.pre('save', function (next) {
  if (this.userId && !this.studentId) {
    this.studentId = this.userId;
  }
  next();
});

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
