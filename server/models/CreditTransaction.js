import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['EARN', 'SPEND', 'REFUND', 'BONUS'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true }, // e.g. "Completed JavaScript Closures Quiz"
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null }, // EventId, ResourceId, etc.
}, { timestamps: true });

export default mongoose.model('CreditTransaction', creditTransactionSchema);
