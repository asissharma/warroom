import mongoose, { Schema, Document } from 'mongoose';

export interface ICapture extends Document {
  type: 'note' | 'insight' | 'bookmark' | 'connection';
  note: string;
  tags: string[];
  // Linkage to a specific entity in the knowledge graph
  blockType?: string;        // 'spine' | 'softSkill' | 'payableSkill' | 'project' | 'questions' | 'survival'
  refId?: string;            // MongoDB ObjectId of the linked TechSpine / Skill / Project / Question doc
  refName?: string;          // Human-readable name for display: "Binary Trees", "Docker Compose", etc.
  topicId?: string;          // DEPRECATED — kept for backward compat, use refId
  sessionDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const CaptureSchema = new Schema<ICapture>(
  {
    type: { type: String, enum: ['note', 'insight', 'bookmark', 'connection'], required: true },
    note: { type: String, required: true },
    tags: { type: [String], default: [] },
    blockType: { type: String },
    refId: { type: String },
    refName: { type: String },
    topicId: { type: String },   // deprecated
    sessionDay: { type: Number, required: true },
  },
  { timestamps: true, collection: 'captures' }
);

// Index for full-text search
CaptureSchema.index({ note: 'text', tags: 'text' });
// Index for finding captures linked to a specific entity
CaptureSchema.index({ refId: 1, blockType: 1 });

export default mongoose.models.Capture || mongoose.model<ICapture>('Capture', CaptureSchema);
