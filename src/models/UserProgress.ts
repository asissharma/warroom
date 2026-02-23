import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
    date: Date;
    deepWorkMinutes: number;
    spineTopicsCompleted: string[];
    fragmentedItemsCompleted: string[];
    notes?: string;
}

const UserProgressSchema: Schema = new Schema({
    date: { type: Date, required: true, unique: true },
    deepWorkMinutes: { type: Number, required: true, default: 0 },
    spineTopicsCompleted: { type: [String], default: [] },
    fragmentedItemsCompleted: { type: [String], default: [] },
    notes: { type: String }
}, {
    timestamps: true,
});

export const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
