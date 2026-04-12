import mongoose, { Schema, Document } from 'mongoose';

export interface ISurvivalTopic {
  id: string;
  title: string;
  drill: string;
  connectedTopicKeys: string[];
}

export interface ISurvivalArea extends Document {
  areaId: number;
  area: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  why: string;
  topics: ISurvivalTopic[];
}

const SurvivalTopicSchema = new Schema<ISurvivalTopic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  drill: { type: String, required: true },
  connectedTopicKeys: { type: [String], default: [] },
}, { _id: false });

const SurvivalAreaSchema = new Schema<ISurvivalArea>(
  {
    areaId: { type: Number, required: true, unique: true },
    area: { type: String, required: true },
    urgency: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    why: { type: String, required: true },
    topics: { type: [SurvivalTopicSchema], default: [] },
  },
  { timestamps: true, collection: 'survivalAreas' }
);

export default mongoose.models.SurvivalArea || mongoose.model<ISurvivalArea>('SurvivalArea', SurvivalAreaSchema);
