import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  slot: { type: String, required: true }, // e.g. "Monday 10:00 AM"
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  mentorNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('MentorshipRequest', mentorshipRequestSchema);
