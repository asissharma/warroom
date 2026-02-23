import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectStatus extends Document {
    projectId: string; // ID mapping to the PROJECT_DANCE_150 list
    title: string;
    category: string;
    status: 'To Do' | 'In Progress' | 'Done';
    startedAt?: Date;
    completedAt?: Date;
    repositoryUrl?: string;
    notes?: string;
}

const ProjectStatusSchema: Schema = new Schema({
    projectId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    repositoryUrl: { type: String },
    notes: { type: String }
}, {
    timestamps: true,
});

export const ProjectStatus: Model<IProjectStatus> = mongoose.models.ProjectStatus || mongoose.model<IProjectStatus>('ProjectStatus', ProjectStatusSchema);
