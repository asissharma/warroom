import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Omit<Document, '_id'> {
  _id: string; // explicitly string for singleton
  startDate: Date;
  defaultSessionMinutes: 15 | 30 | 60 | 90;
  syllabusConfig: {
    slug: string;
    enabled: boolean;
    weight: number;
    maxPerSession: number;
  }[];
  sm2: {
    mediumThreshold: number;
    criticalThreshold: number;
  };
  ai: {
    enabled: boolean;
    teachModel: string;
    analyseModel: string;
    practiceModel: string;
    summaryModel: string;
    fallbackModel: string;
  };
}

export interface ISettingsModel extends Model<ISettings> {
  getSingleton(): Promise<ISettings>;
}

const SettingsSchema = new Schema<ISettings>(
  {
    _id: { type: String, default: 'singleton' },
    startDate: { type: Date, default: Date.now },
    defaultSessionMinutes: { type: Number, enum: [15, 30, 60, 90], default: 30 },
    syllabusConfig: {
      type: [
        {
          slug: { type: String, required: true },
          enabled: { type: Boolean, required: true },
          weight: { type: Number, required: true },
          maxPerSession: { type: Number, required: true }
        }
      ],
      default: []
    },
    sm2: {
      mediumThreshold: { type: Number, default: 3 },
      criticalThreshold: { type: Number, default: 5 }
    },
    ai: {
      enabled: { type: Boolean, default: true },
      teachModel: { type: String, default: 'llama-3.3-70b-versatile' },
      analyseModel: { type: String, default: 'llama-3.3-70b-versatile' },
      practiceModel: { type: String, default: 'llama-3.3-70b-versatile' },
      summaryModel: { type: String, default: 'llama-3.3-70b-versatile' },
      fallbackModel: { type: String, default: 'llama-3.3-70b-versatile' }
    }
  },
  { timestamps: true, collection: 'settings' }
);

SettingsSchema.statics.getSingleton = async function () {
  const defaultSettings = {
    _id: 'singleton',
    startDate: new Date(),
    defaultSessionMinutes: 60,
    syllabusConfig: [
      { slug: 'tech-spine', enabled: true, weight: 1, maxPerSession: 5 },
      { slug: 'questions', enabled: true, weight: 1, maxPerSession: 9 },
      { slug: 'projects', enabled: true, weight: 1, maxPerSession: 1 },
      { slug: 'soft-skills', enabled: true, weight: 1, maxPerSession: 1 },
      { slug: 'payable-skills', enabled: true, weight: 1, maxPerSession: 1 },
      { slug: 'survival-gaps', enabled: true, weight: 1, maxPerSession: 1 }
    ],
    sm2: { mediumThreshold: 3, criticalThreshold: 5 },
    ai: {
      enabled: true,
      teachModel: 'llama-3.3-70b-versatile',
      analyseModel: 'llama-3.3-70b-versatile',
      practiceModel: 'llama-3.3-70b-versatile',
      summaryModel: 'llama-3.3-70b-versatile',
      fallbackModel: 'llama-3.3-70b-versatile'
    }
  };

  return this.findOneAndUpdate(
    { _id: 'singleton' },
    { $setOnInsert: defaultSettings },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const SettingsModel = (mongoose.models.Settings as unknown as ISettingsModel) ||
  mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema);
