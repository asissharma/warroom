import mongoose, { Schema } from 'mongoose'
import type { IShadowInsight } from '@/types'

const ShadowInsightSchema = new Schema<IShadowInsight>({
    userId: { type: String, required: true },
    topicKey: { type: String, required: true },
    keyConcepts: [{ type: String }],
    weakSpots: [{ type: String }],
    relatedTopics: [{ type: String }],
    suggestRevisitIn: { type: Number, default: 0 },
    rawSummary: { type: String, required: true }
}, { timestamps: true })

ShadowInsightSchema.index({ userId: 1, topicKey: 1 }, { unique: true })

export const ShadowInsight = mongoose.models.ShadowInsight || mongoose.model<IShadowInsight>('ShadowInsight', ShadowInsightSchema)
