import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Lesson Type: video, pdf, or text
  type: { 
    type: String, 
    enum: ['video', 'pdf', 'text'], 
    default: 'video' 
  },

  // Media & File Metadata (Storage Reference)
  contentUrl: { type: String, default: '' }, // URL to video or PDF file
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 }, // in bytes
  duration: { type: Number, default: 0 }, // in seconds for video lessons
  
  // Text / markdown content fallback or lesson notes
  content: { type: String, default: '' },
  
  // Upload & Processing State
  uploadStatus: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'ready'
  },

  order: { type: Number, required: true, default: 1 },
  wordCount: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate wordCount on save if text content exists
lessonSchema.pre('save', function (next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).length;
  }
  next();
});

export default mongoose.model('Lesson', lessonSchema);
