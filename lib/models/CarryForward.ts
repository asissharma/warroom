import mongoose, { Schema } from 'mongoose'
import type { ICarryForward } from '../types'

const CarryForwardSchema = new Schema<ICarryForward>({
    userId: { type: String, required: true },
    fromDayN: { type: Number, required: true, min: 1, max: 180 },
    toDayN: { type: Number, required: true, min: 1, max: 180 },
    taskId: { type: String, required: true },
    taskText: { type: String, required: true },
    taskType: {
        type: String,
        enum: ['tech', 'build', 'mastery', 'human'],
        required: true
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date }
}, { timestamps: true })

CarryForwardSchema.index({ userId: 1, toDayN: 1, resolved: 1 })
CarryForwardSchema.index({ userId: 1, taskId: 1 }, { unique: true })

export const CarryForward = mongoose.models.CarryForward || mongoose.model<ICarryForward>('CarryForward', CarryForwardSchema)
