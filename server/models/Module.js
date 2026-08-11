import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);
