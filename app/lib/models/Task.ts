import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'in_progress' | 'completed' | 'dropped';
  priority: 'low' | 'medium' | 'high';
  type: 'learning' | 'project' | 'admin' | 'review';
  relatedNodeKey?: string;
  scheduledFor?: string;
  dueDate?: Date;
  tags: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'dropped'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    type: { type: String, enum: ['learning', 'project', 'admin', 'review'], default: 'learning' },
    relatedNodeKey: String,
    scheduledFor: String,
    dueDate: Date,
    tags: { type: [String], default: [] },
    completedAt: Date,
  },
  { timestamps: true, collection: 'tasks' }
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, scheduledFor: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
