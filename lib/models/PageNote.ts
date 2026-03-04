import mongoose, { Schema } from 'mongoose'

export interface IBlock {
    id: string
    type: 'text' | 'code' | 'todo' | 'h1' | 'h2' | 'h3' | 'divider'
    content: string
    checked?: boolean
    language?: string
}

export interface IPageNote {
    userId: string
    pageId: string         // e.g. "questions:12"
    collectionKey: string  // e.g. "questions"
    rowId: string          // e.g. "12"
    blocks: IBlock[]
    createdAt: Date
    updatedAt: Date
}

const BlockSchema = new Schema<IBlock>({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'code', 'todo', 'h1', 'h2', 'h3', 'divider'],
        required: true
    },
    content: { type: String, default: '' },
    checked: { type: Boolean },
    language: { type: String }
}, { _id: false }) // Don't generate Mongo _ids for subdocuments, we use our own uuid

const PageNoteSchema = new Schema<IPageNote>({
    userId: { type: String, required: true, default: 'default_user' },
    pageId: { type: String, required: true, unique: true },
    collectionKey: { type: String, required: true },
    rowId: { type: String, required: true },
    blocks: { type: [BlockSchema], default: [] }
}, { timestamps: true })

PageNoteSchema.index({ userId: 1, collectionKey: 1, rowId: 1 })

export const PageNote = mongoose.models.PageNote || mongoose.model<IPageNote>('PageNote', PageNoteSchema)
