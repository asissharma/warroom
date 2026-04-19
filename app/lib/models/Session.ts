import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionResult {
  itemId: mongoose.Types.ObjectId;
  syllabusSlug: string;
  result: 'done' | 'struggled' | 'skipped';
  timestamp: Date;
}

export interface ISession extends Document {
  date: string;
  dayNumber: number;
  plannedMinutes: 15 | 30 | 60 | 90;
  plannedItems: mongoose.Types.ObjectId[];
  populatedItems: any;
  status: 'planned' | 'in_progress' | 'completed';
  startedAt: Date | null;
  completedAt: Date | null;
  results: ISessionResult[];
  score: number | null;
  itemsDone: number;
  itemsStruggled: number;
  itemsSkipped: number;
  honestNote?: string;
  tomorrowFocus?: {
    topGap: string | null;
    nextTopic: string | null;
    overdueCount: number;
  } | null;
  gapAlert?: {
    days: number;
    severity: 'low' | 'critical';
  } | null;
  carryForward?: mongoose.Types.ObjectId[] | null;
}

const SessionResultSchema = new Schema<ISessionResult>({
  itemId: { type: Schema.Types.ObjectId, required: true },
  syllabusSlug: { type: String, required: true },
  result: { type: String, enum: ['done', 'struggled', 'skipped'], required: true },
  timestamp: { type: Date, required: true }
}, { _id: false });

const SessionSchema = new Schema<ISession>(
  {
    date: { type: String, required: true, unique: true },
    dayNumber: { type: Number, required: true },
    plannedMinutes: { type: Number, enum: [15, 30, 60, 90], required: true },
    plannedItems: { type: [Schema.Types.ObjectId], default: [] },
    populatedItems: { type: Schema.Types.Mixed, default: [] },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed'],
      default: 'planned'
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    results: { type: [SessionResultSchema], default: [] },
    score: { type: Number, default: null },
    itemsDone: { type: Number, default: 0 },
    itemsStruggled: { type: Number, default: 0 },
    itemsSkipped: { type: Number, default: 0 },
    honestNote: { type: String },
    tomorrowFocus: {
      type: {
        topGap: { type: String, default: null },
        nextTopic: { type: String, default: null },
        overdueCount: { type: Number, default: 0 }
      },
      default: null
    },
    gapAlert: {
      type: {
        days: { type: Number, required: true },
        severity: { type: String, enum: ['low', 'critical'], required: true }
      },
      default: null
    },
    carryForward: { type: [Schema.Types.ObjectId], default: [] }
  },
  { timestamps: true, collection: 'sessions' }
);

export const SessionModel: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
