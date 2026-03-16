import mongoose, { Schema } from 'mongoose'
import type { IWeeklyDigest } from '@/types'

const WeeklyDigestSchema = new Schema<IWeeklyDigest>({
    weekNumber: { type: Number, required: true },
    dayN: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    mastered: { type: [String], default: [] },
    fragile: { type: [String], default: [] },
    skipRisk: { type: [String], default: [] },
    nextWeekFocus: { type: String, default: '' },
    honestAssessment: { type: String, default: '' },
    rawText: { type: String }
}, { timestamps: true })

WeeklyDigestSchema.index({ weekNumber: 1 }, { unique: true })

export const WeeklyDigest = mongoose.models.WeeklyDigest || mongoose.model<IWeeklyDigest>('WeeklyDigest', WeeklyDigestSchema)