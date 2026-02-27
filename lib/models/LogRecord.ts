import mongoose, { Schema } from 'mongoose'
import type { ILogRecord } from '../types'

const LogRecordSchema = new Schema<ILogRecord>({
    userId: { type: String, required: true },
    dayN: { type: Number, required: true, min: 1, max: 180 },
    text: { type: String, required: true, maxlength: 500 },
    type: {
        type: String,
        enum: ['win', 'skip', 'key', 'block'],
        required: true
    }
}, { timestamps: true })

LogRecordSchema.index({ userId: 1, createdAt: -1 })

// Keep only the latest 200 logs per user
LogRecordSchema.statics.pruneOldest = async function (userId: string) {
    const records = await this.find({ userId }).sort({ createdAt: -1 }).skip(200).select('_id')
    if (records.length > 0) {
        const idsToDelete = records.map((r: any) => r._id)
        await this.deleteMany({ _id: { $in: idsToDelete } })
    }
}

export const LogRecord = mongoose.models.LogRecord || mongoose.model<ILogRecord>('LogRecord', LogRecordSchema)
