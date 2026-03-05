import mongoose, { Schema } from 'mongoose'

const TopicStatusSchema = new Schema({
    userId: { type: String, required: true },
    topicKey: { type: String, required: true },
    status: {
        type: String,
        enum: ['done', 'partial', 'revisit', 'not_started'],
        default: 'not_started'
    }
}, { timestamps: true })

TopicStatusSchema.index({ userId: 1, topicKey: 1 }, { unique: true })

export const TopicStatus = mongoose.models.TopicStatus || mongoose.model('TopicStatus', TopicStatusSchema)
