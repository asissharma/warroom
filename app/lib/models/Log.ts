import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  type: 'progress' | 'system' | 'intel' | 'note' | 'milestone';
  userId: mongoose.Types.ObjectId;
  message: string;
  details?: Record<string, any>;
  nodeKey?: string;
  topicKey?: string;
  sessionDate?: string;
  tags: string[];
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    type: { type: String, enum: ['progress', 'system', 'intel', 'note', 'milestone'], required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    nodeKey: String,
    topicKey: String,
    sessionDate: String,
    tags: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'logs' }
);

LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
