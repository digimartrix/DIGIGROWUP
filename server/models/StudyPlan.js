import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  targetDate: { type: String, required: true }, // "YYYY-MM-DD"
  dailyStudyTime: { type: Number, default: 30 }, // in minutes
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  tasks: [{
    title: { type: String, required: true },
    dueDate: { type: String },
    completed: { type: Boolean, default: false },
  }],
}, { timestamps: true });

export default mongoose.model('StudyPlan', studyPlanSchema);
