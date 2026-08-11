import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true }, // "HH:MM"
  mentor: { type: String, default: '' },
  capacity: { type: Number, default: 50 },
  type: { type: String, enum: ['Workshop', 'Hackathon', 'Webinar', 'Bootcamp'], default: 'Workshop' },
  creditsCost: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
