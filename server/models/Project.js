import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problemStatement: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  requiredSkills: [{ type: String }],
  technology: [{ type: String }],
  milestones: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
  }],
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
