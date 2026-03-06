import mongoose, { Schema } from 'mongoose'

const SurvivalTopicSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    drill: { type: String, required: true },
    connectedTopicKeys: [{ type: String }]
})

const SurvivalAreaSchema = new Schema({
    id: { type: Number, required: true },
    area: { type: String, required: true },
    urgency: { type: String, required: true },
    why: { type: String, required: true },
    topics: [SurvivalTopicSchema],
    resources: [{
        name: { type: String, required: true },
        author: { type: String, required: true },
        free: { type: Boolean, required: true },
        url: { type: String }
    }],
    spineConnection: { type: String }
})

export const SurvivalAreaModel = mongoose.models.SurvivalArea || mongoose.model('SurvivalArea', SurvivalAreaSchema)
