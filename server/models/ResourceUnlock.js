import mongoose from 'mongoose';

const resourceUnlockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true });

resourceUnlockSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.model('ResourceUnlock', resourceUnlockSchema);
