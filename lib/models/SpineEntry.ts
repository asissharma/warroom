import mongoose, { Schema } from 'mongoose'

const SpineEntrySchema = new Schema({
    id: { type: Number, required: true },
    area: { type: String, required: true },
    phase: { type: String, required: true },
    weekStart: { type: Number, required: true },
    weekEnd: { type: Number, required: true },
    dayStart: { type: Number, required: true },
    dayEnd: { type: Number, required: true },
    topics: [{ type: String }],
    topicKeys: [{ type: String }],
    microtasks: [{ type: String }],
    resource: { type: String },
    resourceUrl: { type: String }
})

export const SpineEntryModel = mongoose.models.SpineEntry || mongoose.model('SpineEntry', SpineEntrySchema)
