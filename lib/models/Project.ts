import mongoose, { Schema } from 'mongoose'

const ProjectSchema = new Schema({
    day: { type: Number, required: true },
    phase: { type: String, required: true },
    category: { type: String, required: true },
    name: { type: String, required: true },
    doneMeans: { type: String, required: true }
})

export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema)
