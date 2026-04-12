import mongoose, { Schema, Document } from 'mongoose';

export interface INode extends Document {
  key: string;
  topicKey: string;
  phase: number;
  title: string;
  description?: string;
  type: 'concept' | 'practice' | 'milestone' | 'review' | 'lab';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  order: number;
  unlockRequirements?: string[];
  estimatedMinutes: number;
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'doc' | 'repo';
  }[];
  userId: mongoose.Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema = new Schema<INode>(
  {
    key: { type: String, required: true, unique: true },
    topicKey: { type: String, required: true, ref: 'Topic' },
    phase: { type: Number, default: 0 },
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['concept', 'practice', 'milestone', 'review', 'lab'], default: 'concept' },
    status: { type: String, enum: ['locked', 'available', 'in_progress', 'completed'], default: 'locked' },
    order: { type: Number, default: 0 },
    unlockRequirements: { type: [String], default: [] },
    estimatedMinutes: { type: Number, default: 30 },
    resources: [{
      title: String,
      url: String,
      type: { type: String, enum: ['article', 'video', 'course', 'doc', 'repo'] },
    }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: Date,
  },
  { timestamps: true, collection: 'nodes' }
);

NodeSchema.index({ topicKey: 1, phase: 1, order: 1 });

export default mongoose.models.Node || mongoose.model<INode>('Node', NodeSchema);
