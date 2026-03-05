import mongoose, { Schema } from 'mongoose'

const IntelRecordSchema = new Schema({
    userId: { type: String, required: true },
    dayN: { type: Number, required: true },
    topicKey: { type: String, required: true }, // e.g. "redis", "decorators"
    phase: { type: String, required: true },
    title: { type: String, required: true },
    what: { type: String, required: true }, // what I learned
    how: { type: String, required: true }, // how I learned it (process/method)
    resources: [{
        label: { type: String },
        url: { type: String }
    }],
    codeSnippet: { type: String }, // optional — raw code block
    blockers: { type: String }, // what got stuck
    timeSpentMins: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

IntelRecordSchema.index({ userId: 1, dayN: 1 })
IntelRecordSchema.index({ userId: 1, topicKey: 1 })

export const IntelRecord = mongoose.models.IntelRecord || mongoose.model('IntelRecord', IntelRecordSchema)
