import mongoose, { Schema, Document } from 'mongoose';

export interface IGapTracker extends Document {
  concept: string;
  sourceType: 'spine' | 'question' | 'project' | 'softSkill' | 'payableSkill' | 'survival';
  sourceId: string;
  flagCount: number;
  severity: 'low' | 'medium' | 'critical';
  depthReached: 1 | 2 | 3;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const GapTrackerSchema = new Schema<IGapTracker>(
  {
    concept: { type: String, required: true },
    sourceType: { type: String, enum: ['spine', 'question', 'project', 'softSkill', 'payableSkill', 'survival'], required: true },
    sourceId: { type: String, required: true },
    flagCount: { type: Number, default: 1 },
    severity: { type: String, enum: ['low', 'medium', 'critical'], default: 'low' },
    depthReached: { type: Number, enum: [1, 2, 3], default: 1 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true, collection: 'gapTracker' }
);

export default mongoose.models.GapTracker || mongoose.model<IGapTracker>('GapTracker', GapTrackerSchema);
