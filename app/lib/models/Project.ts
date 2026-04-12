import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  order: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const ProjectSchema = new Schema<IProject>(
  {
    order: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
