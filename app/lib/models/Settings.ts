import mongoose, { Schema, Document } from 'mongoose';

export interface IAIProviders {
  teaching?: string;
  analysis?: string;
  chat?: string;
  deepDive?: string;
  fallback?: string;
}

export interface IGapThresholds {
  mediumTrigger: number;
  criticalTrigger: number;
  maxCritical: number;
}

export interface ISettings extends Document {
  programStartDate: Date;
  programLength: number;
  currentPhase: 'Foundation' | 'Intermediate' | 'Advanced';
  questionsPerDay: number;
  gapThresholds: IGapThresholds;
  aiProviders: IAIProviders;
  carryForwardEnabled: boolean;
  sm2Enabled: boolean;
  sessionOverride?: number;
}

const SettingsSchema = new Schema<ISettings>(
  {
    programStartDate: { type: Date, default: () => new Date() },
    programLength: { type: Number, default: 150 },
    currentPhase: { type: String, enum: ['Foundation', 'Intermediate', 'Advanced'], default: 'Foundation' },
    questionsPerDay: { type: Number, default: 9 },
    gapThresholds: {
      mediumTrigger: { type: Number, default: 2 },
      criticalTrigger: { type: Number, default: 3 },
      maxCritical: { type: Number, default: 5 },
    },
    aiProviders: {
      teaching: { type: String, default: 'groq' },
      analysis: { type: String, default: 'gemini' },
      chat: { type: String, default: 'claude' },
      deepDive: { type: String, default: 'claude' },
      fallback: { type: String, default: 'openrouter' },
    },
    carryForwardEnabled: { type: Boolean, default: true },
    sm2Enabled: { type: Boolean, default: true },
    sessionOverride: { type: Number },
  },
  { timestamps: true, collection: 'settings' }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
