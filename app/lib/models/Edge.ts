import mongoose, { Schema, Document } from 'mongoose';

export interface IEdge extends Document {
  source: string;
  target: string;
  type: 'prerequisite' | 'related' | 'next';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EdgeSchema = new Schema<IEdge>(
  {
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, enum: ['prerequisite', 'related', 'next'], default: 'next' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'edges' }
);

EdgeSchema.index({ source: 1, target: 1 }, { unique: true });

export default mongoose.models.Edge || mongoose.model<IEdge>('Edge', EdgeSchema);
