import mongoose, { Schema } from 'mongoose'
import type { ISkillProgress } from '../types'

const SkillProgressSchema = new Schema<ISkillProgress>({
    userId: { type: String, required: true },
    barKey: {
        type: String,
        enum: ['python_algo_oop', 'databases_concurrency', 'js_node_security', 'ml_ai_mlops', 'build_output'],
        required: true
    },
    value: { type: Number, required: true, min: 0, max: 100 },
    level: { type: Number, required: true, min: 1, max: 10 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true })

SkillProgressSchema.index({ userId: 1, barKey: 1 }, { unique: true })

export const SkillProgress = mongoose.models.SkillProgress || mongoose.model<ISkillProgress>('SkillProgress', SkillProgressSchema)
