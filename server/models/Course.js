import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, default: 'General' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  estimatedHours: { type: Number, default: 10 },
  estimatedDuration: { type: String, default: '10 hours' },
  thumbnail: { type: String, default: '' },
  creditsCost: { type: Number, default: 0 }, // DigiCredits required (0 for free)
  
  // Delivery Type: Video Course, PDF Course, or Text/Interactive Course
  courseType: { 
    type: String, 
    enum: ['video', 'pdf', 'text'], 
    default: 'video', 
    required: true 
  },

  // Course Lifecycle Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'published', 'unpublished', 'rejected'],
    default: 'draft',
    required: true
  },
  rejectionReason: { type: String, default: '' },

  // Course Metadata
  learningObjectives: [{ type: String }],
  prerequisites: [{ type: String }],
  enrollmentCount: { type: Number, default: 0 },

  // Creator / Instructor
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Ensure instructorId syncs with createdBy
courseSchema.pre('save', function (next) {
  if (this.createdBy && !this.instructorId) {
    this.instructorId = this.createdBy;
  }
  next();
});

export default mongoose.model('Course', courseSchema);
