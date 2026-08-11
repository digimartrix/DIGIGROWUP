import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  wordCount: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate wordCount on save
lessonSchema.pre('save', function (next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).length;
  }
  next();
});

export default mongoose.model('Lesson', lessonSchema);
