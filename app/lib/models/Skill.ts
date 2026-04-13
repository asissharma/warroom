import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  order: number;
  type: 'soft' | 'payable';
  name: string;
  prompt: string;
  chapter?: string;
  completionPercent?: number;
  status: 'pending' | 'in-progress' | 'completed';
}

const SkillSchema = new Schema<ISkill>(
  {
    order: { type: Number, required: true },
    type: { type: String, enum: ['soft', 'payable'], required: true },
    name: { type: String, required: true },
    prompt: { type: String },
    chapter: { type: String },
    completionPercent: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
