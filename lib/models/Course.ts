import mongoose, { Schema } from 'mongoose'

const CourseSchema = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    area: { type: String, required: true },
    url: { type: String, required: true },
    spineWeek: { type: Number, required: true },
    estimatedHours: { type: Number, required: true }
})

export const CourseModel = mongoose.models.Course || mongoose.model('Course', CourseSchema)
