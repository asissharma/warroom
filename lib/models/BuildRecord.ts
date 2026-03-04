import mongoose, { Schema } from 'mongoose'

export interface IBuildRecord {
    userId: string
    projectId: string
    doneMeansChecked: boolean
    githubUrl: string
    demoUrl: string
    hours: number | null
    selfScore: number // 0-5
    whatICut: string
    whatBroke: string
    createdAt: Date
    updatedAt: Date
}

const BuildRecordSchema = new Schema<IBuildRecord>({
    userId: { type: String, required: true, default: 'default_user' },
    projectId: { type: String, required: true },
    doneMeansChecked: { type: Boolean, default: false },
    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    hours: { type: Number, default: null },
    selfScore: { type: Number, default: 0 },
    whatICut: { type: String, default: '' },
    whatBroke: { type: String, default: '' }
}, { timestamps: true })

BuildRecordSchema.index({ userId: 1, projectId: 1 }, { unique: true })

export const BuildRecord = mongoose.models.BuildRecord || mongoose.model<IBuildRecord>('BuildRecord', BuildRecordSchema)
