import mongoose, { Schema } from 'mongoose'

const BasicSkillSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    dailyDrill: { type: String, required: true }
})

export const BasicSkillModel = mongoose.models.BasicSkill || mongoose.model('BasicSkill', BasicSkillSchema)
