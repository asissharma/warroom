import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizResult extends Document {
    date: Date;
    questionId: string; // Mapping to FINALQUESTIONS.xlsx
    topic: string;
    isCorrect: boolean;
    confidenceLevel: 1 | 2 | 3 | 4 | 5; // 1: Guess, 5: Absolute Certainty
    notes?: string;
}

const QuizResultSchema: Schema = new Schema({
    date: { type: Date, required: true, default: Date.now },
    questionId: { type: String, required: true },
    topic: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    confidenceLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    notes: { type: String }
}, {
    timestamps: true,
});

// Index to easily fetch history for a specific question
QuizResultSchema.index({ questionId: 1, date: -1 });

export const QuizResult: Model<IQuizResult> = mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
