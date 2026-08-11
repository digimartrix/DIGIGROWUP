import mongoose from 'mongoose';

const masteryScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  score: { type: Number, default: 0, min: 0, max: 100 }, // 0-100
  lastUpdated: { type: Date, default: Date.now },
});

masteryScoreSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default mongoose.model('MasteryScore', masteryScoreSchema);
