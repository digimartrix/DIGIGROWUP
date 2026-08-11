import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  expertise: [{ type: String }],
  experience: { type: Number, default: 2 },
  bio: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  availability: [{ type: String }],
  skills: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Mentor', mentorSchema);
