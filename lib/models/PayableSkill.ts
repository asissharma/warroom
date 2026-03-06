import mongoose, { Schema } from 'mongoose'

const PayableSkillSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    dayStart: { type: Number, required: true },
    dayEnd: { type: Number, required: true },
    coreBooks: [{ type: String }],
    microPractice: { type: String },
    weeklyGoal: { type: String },
    chapterMap: {
        type: Map,
        of: String
    }
})

export const PayableSkillModel = mongoose.models.PayableSkill || mongoose.model('PayableSkill', PayableSkillSchema)
