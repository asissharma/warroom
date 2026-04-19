import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyllabusItem extends Document {
  syllabusSlug: string;
  title: string;
  difficulty?: 1 | 2 | 3;
  phase?: string;
  orderIndex?: number;
  status: 'not_started' | 'in_progress' | 'done' | 'skipped' | 'retired';
  completedCount: number;
  skippedCount: number;
  lastTouchedAt: Date | null;

  sm2: {
    easeFactor: number;
    interval: number;
    repetition: number;
    nextReviewDate: Date;
    timesStruggled: number;
  } | null;

  gap: {
    isFlagged: boolean;
    flagCount: number;
    severity: 'low' | 'medium' | 'critical';
    lastAddressedAt: Date | null;
  } | null;

  meta: any;
}

const SyllabusItemSchema = new Schema<ISyllabusItem>(
  {
    syllabusSlug: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: Number, enum: [1, 2, 3] },
    phase: { type: String },
    orderIndex: { type: Number },
    status: {
      type: String,
      required: true,
      enum: ['not_started', 'in_progress', 'done', 'skipped', 'retired'],
      default: 'not_started'
    },
    completedCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    lastTouchedAt: { type: Date, default: null },

    sm2: {
      type: {
        easeFactor: { type: Number, default: 2.5 },
        interval: { type: Number, required: true },
        repetition: { type: Number, required: true },
        nextReviewDate: { type: Date, required: true },
        timesStruggled: { type: Number, default: 0 }
      },
      default: null
    },

    gap: {
      type: {
        isFlagged: { type: Boolean, required: true },
        flagCount: { type: Number, required: true },
        severity: { type: String, enum: ['low', 'medium', 'critical'], required: true },
        lastAddressedAt: { type: Date, default: null }
      },
      default: null
    },

    meta: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, collection: 'syllabusitems' }
);

SyllabusItemSchema.index({ syllabusSlug: 1, status: 1 });
SyllabusItemSchema.index({ syllabusSlug: 1, 'sm2.nextReviewDate': 1 });
SyllabusItemSchema.index({ syllabusSlug: 1, title: 1 });
SyllabusItemSchema.index({ 'gap.severity': 1 });

export const SyllabusItemModel: Model<ISyllabusItem> =
  mongoose.models.SyllabusItem || mongoose.model<ISyllabusItem>('SyllabusItem', SyllabusItemSchema);
