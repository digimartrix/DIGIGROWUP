import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['PDF', 'Article', 'Cheatsheet', 'Template', 'Dataset', 'Code'], default: 'PDF' },
  downloadUrl: { type: String, default: '' },
  creditsCost: { type: Number, default: 0 }, // 0 means free
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
