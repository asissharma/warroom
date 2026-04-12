import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  key: string;
  name: string;
  type: 'skill' | 'project' | 'domain' | 'cert';
  description?: string;
  currentPhase: number;
  totalPhases: number;
  phaseNames: string[];
  icon?: string;
  color?: string;
  active: boolean;
  order: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['skill', 'project', 'domain', 'cert'], required: true },
    description: String,
    currentPhase: { type: Number, default: 0 },
    totalPhases: { type: Number, default: 1 },
    phaseNames: { type: [String], default: [] },
    icon: String,
    color: { type: String, default: '#3b82f6' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'topics' }
);

export default mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
