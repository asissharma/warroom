import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockStatus {
  status: 'NotStarted' | 'InProgress' | 'Paused' | 'Skipped' | 'Done' | 'Partial';
}

export interface ISession extends Document {
  dayNumber: number;
  phase: string;
  date: string;
  blocks: {
    spine?: IBlockStatus & { refId?: mongoose.Types.ObjectId; area?: string; topicToday?: string; microtaskToday?: string; resource?: string };
    softSkill?: IBlockStatus & { refId?: mongoose.Types.ObjectId; skillName?: string; prompt?: string; isDone?: boolean };
    payableSkill?: IBlockStatus & { refId?: mongoose.Types.ObjectId; topicName?: string; chapter?: string; prompt?: string; isDone?: boolean };
    survival?: IBlockStatus & { gapName?: string; severity?: string; flagCount?: number; daysSinceOpen?: number };
    questions?: IBlockStatus & { total?: number; correct?: number; struggled?: number; items?: any[] };
    project?: IBlockStatus & { refId?: mongoose.Types.ObjectId; projectName?: string; description?: string };
  };
  momentumScore: number;
  gapsFlagged: mongoose.Types.ObjectId[];
  captures: mongoose.Types.ObjectId[];
  honestNote: string;
  tomorrowFocus: string;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    dayNumber: { type: Number, required: true },
    phase: { type: String, required: true },
    date: { type: String, required: true },
    blocks: { type: Schema.Types.Mixed, default: {} },
    momentumScore: { type: Number, default: 0 },
    gapsFlagged: [{ type: Schema.Types.ObjectId, ref: 'GapTracker' }],
    captures: [{ type: Schema.Types.ObjectId, ref: 'Capture' }],
    honestNote: { type: String, default: '' },
    tomorrowFocus: { type: String, default: '' },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'sessions' }
);

SessionSchema.index({ date: 1 }, { unique: true });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
