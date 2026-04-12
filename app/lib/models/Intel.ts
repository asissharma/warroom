import mongoose, { Schema, Document } from 'mongoose';

export interface IIntel extends Document {
  content: string;
  userId: mongoose.Types.ObjectId;
  source: 'manual' | 'article' | 'video' | 'podcast' | 'conversation' | 'book' | 'other';
  sourceUrl?: string;
  sourceTitle?: string;
  tags: string[];
  topicKeys: string[];
  nodeKeys: string[];
  connections: {
    intelId: mongoose.Types.ObjectId;
    strength: number;
    reason?: string;
  }[];
  embedding?: number[];
  processed: boolean;
  summary?: string;
  insights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IntelSchema = new Schema<IIntel>(
  {
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: ['manual', 'article', 'video', 'podcast', 'conversation', 'book', 'other'], default: 'manual' },
    sourceUrl: String,
    sourceTitle: String,
    tags: { type: [String], default: [] },
    topicKeys: { type: [String], default: [] },
    nodeKeys: { type: [String], default: [] },
    connections: [{
      intelId: { type: Schema.Types.ObjectId, ref: 'Intel' },
      strength: { type: Number, min: 0, max: 1 },
      reason: String,
    }],
    embedding: { type: [Number], select: false },
    processed: { type: Boolean, default: false },
    summary: String,
    insights: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'intel' }
);

IntelSchema.index({ userId: 1, createdAt: -1 });
IntelSchema.index({ userId: 1, topicKeys: 1 });

export default mongoose.models.Intel || mongoose.model<IIntel>('Intel', IntelSchema);
