import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyllabus extends Document {
  slug: string;
  name: string;
  itemType: 'question' | 'topic' | 'project' | 'skill' | 'resource' | 'gap';
  daily: {
    enabled: boolean;
    weight: number;
    strategy: 'sm2' | 'sequential' | 'priority' | 'random';
    maxPerSession: number;
  };
  totalItems: number;
}

const SyllabusSchema = new Schema<ISyllabus>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    itemType: {
      type: String,
      required: true,
      enum: ['question', 'topic', 'project', 'skill', 'resource', 'gap']
    },
    daily: {
      enabled: { type: Boolean, required: true },
      weight: { type: Number, required: true, min: 1, max: 10 },
      strategy: {
        type: String,
        required: true,
        enum: ['sm2', 'sequential', 'priority', 'random']
      },
      maxPerSession: { type: Number, required: true }
    },
    totalItems: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'syllabuses' }
);

export const SyllabusModel: Model<ISyllabus> =
  mongoose.models.Syllabus || mongoose.model<ISyllabus>('Syllabus', SyllabusSchema);
