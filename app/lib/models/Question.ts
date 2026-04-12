import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  theme: string;
  difficulty: number;
  status: 'unseen' | 'learning' | 'review' | 'retired';
  nextReviewDate: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    theme: { type: String, required: true },
    difficulty: { type: Number, default: 1 },
    status: { type: String, enum: ['unseen', 'learning', 'review', 'retired'], default: 'unseen' },
    nextReviewDate: { type: Date, default: Date.now },
    interval: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
