import mongoose, { Schema, Document } from 'mongoose';

export interface ITechSpine extends Document {
  order: number;
  phase: string;
  week: number;
  area: string;
  topic: string;
  microtask: string;
  resource: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const TechSpineSchema = new Schema<ITechSpine>(
  {
    order: { type: Number, required: true, unique: true },
    phase: { type: String, required: true },
    week: { type: Number, required: true },
    area: { type: String, required: true },
    topic: { type: String, required: true },
    microtask: { type: String },
    resource: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.TechSpine || mongoose.model<ITechSpine>('TechSpine', TechSpineSchema);
