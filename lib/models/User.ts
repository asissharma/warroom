import mongoose, { Schema } from 'mongoose'
import type { IUser } from '@/types'

const UserSchema = new Schema<IUser>({
    userId: { type: String, default: 'default', unique: true },
    startDate: { type: Date, required: true },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalTasksDone: { type: Number, default: 0 },
    preferences: {
        questionsPerDay: { type: Number, default: 8, min: 8, max: 9 },
        timezone: { type: String, default: 'UTC' },
    },
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
