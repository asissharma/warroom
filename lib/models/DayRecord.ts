import mongoose, { Schema } from 'mongoose'
import type { IDayRecord } from '@/types'

const DayRecordSchema = new Schema<IDayRecord>({
    userId: { type: String, required: true },
    dayN: { type: Number, required: true, min: 1, max: 180 },
    date: { type: Date, required: true },
    completedTaskIds: { type: [String], default: [] },
    isComplete: { type: Boolean, default: false },
    completedAt: { type: Date },
    enrichedTasks: { type: [{ taskId: String, enrichedText: String }], default: [] }
}, { timestamps: true })

DayRecordSchema.index({ userId: 1, dayN: 1 }, { unique: true })

export const DayRecord = mongoose.models.DayRecord || mongoose.model<IDayRecord>('DayRecord', DayRecordSchema)
