import mongoose, { Schema } from 'mongoose'

const QuestionSchema = new Schema({
    id: { type: Number, required: true },
    question: { type: String, required: true },
    theme: { type: String, required: true },
    difficulty: { type: Number, required: true }
})

export const QuestionModel = mongoose.models.Question || mongoose.model('Question', QuestionSchema)
