import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('EventRegistration', eventRegistrationSchema);
