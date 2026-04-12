import mongoose, { Schema, Document } from 'mongoose';

export interface ICapture extends Document {
  type: 'note' | 'insight' | 'bookmark' | 'connection';
  note: string;
  tags: string[];
  topicId?: string;
  sessionDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const CaptureSchema = new Schema<ICapture>(
  {
    type: { type: String, enum: ['note', 'insight', 'bookmark', 'connection'], required: true },
    note: { type: String, required: true },
    tags: { type: [String], default: [] },
    topicId: { type: String },
    sessionDay: { type: Number, required: true },
  },
  { timestamps: true, collection: 'captures' }
);

// Index for full-text search
CaptureSchema.index({ note: 'text', tags: 'text' });

export default mongoose.models.Capture || mongoose.model<ICapture>('Capture', CaptureSchema);
