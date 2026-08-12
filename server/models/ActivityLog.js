import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'system' },
  action: { 
    type: String, 
    required: true,
    enum: [
      'USER_REGISTERED', 'USER_LOGGED_IN', 'USER_ROLE_CHANGED', 'USER_DELETED',
      'COURSE_CREATED', 'COURSE_UPDATED', 'COURSE_DELETED',
      'MODULE_CREATED', 'MODULE_UPDATED', 'MODULE_DELETED',
      'LESSON_CREATED', 'LESSON_UPDATED', 'LESSON_DELETED',
      'QUIZ_CREATED', 'QUIZ_UPDATED', 'QUIZ_SUBMITTED',
      'COURSE_ENROLLED', 'LESSON_COMPLETED',
    ]
  },
  target: { type: String, default: '' }, // e.g. "Web Development Fundamentals"
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ userId: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);
