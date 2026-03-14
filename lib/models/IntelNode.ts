import mongoose, { Schema, Document, Types } from 'mongoose';

// Open type union — add new types without schema migration
export type IntelNodeType =
    | 'task'       // from Cockpit daily missions
    | 'build'      // from Evidence Locker / BuildRecord
    | 'question'   // from mastery questions answered
    | 'skill'      // from skill completions
    | 'survival'   // from survival area drills
    | 'log'        // from journal entries
    | 'concept'    // manually added abstract knowledge
    | 'insight'    // manually added cross-domain insight
    | 'resource'   // URL bookmarks, references
    | 'custom';    // user-defined — free label

export type IntelSource =
    | 'cockpit'         // emitted by /api/task
    | 'evidence-locker' // emitted by /api/brain/build
    | 'log'             // emitted by /api/log
    | 'manual'          // created directly via /api/intel
    | 'system';         // emitted on first question answer / skill tick

export type ConnectionLabel =
    | 'led-to'
    | 'required'
    | 'related'
    | 'contradicts'
    | 'extends'
    | 'custom';

export interface IConnection {
    targetId: Types.ObjectId;
    label: ConnectionLabel;
    customLabel?: string;
    direction: 'uni' | 'bi';
    createdBy: 'auto' | 'user';
    strength: number; // 0.0–1.0 for graph layout gravity
}

export interface IIntelNode extends Document {
    userId: string;

    // ── Identity ──────────────────────────────────────────────────
    type: IntelNodeType;
    customType?: string; // if type === 'custom'
    source: IntelSource;

    // ── Content ───────────────────────────────────────────────────
    title: string;
    body?: string; // markdown supported
    url?: string;  // repo URL, reference link, etc.

    // ── Taxonomy (fully open) ─────────────────────────────────────
    tags: string[];       // user-defined + auto-inherited
    domain?: string;      // inherited from source or set manually
    phase?: number;       // 1-8 curriculum phase (if applicable)
    dayN?: number;        // which day this was generated

    // ── Curriculum reference (for ghost-node promotion) ───────────
    curriculumRef?: {
        sourceJson: 'projects' | 'questions' | 'tech-spine' | 'skills' | 'survival-areas';
        refId: string; // original ID in the JSON
    };

    // ── State ─────────────────────────────────────────────────────
    status: 'active' | 'completed' | 'archived';
    score?: number; // self-scored 0–100

    // ── Graph connections ─────────────────────────────────────────
    connections: IConnection[];

    // ── 3D Canvas Position ────────────────────────────────────────
    canvasPosition?: { x: number; y: number; z: number };

    // ── Meta ──────────────────────────────────────────────────────
    createdAt: Date;
    updatedAt: Date;
    sourceRefId?: string; // DayRecord / BuildRecord original ID
}

const ConnectionSchema = new Schema<IConnection>({
    targetId: { type: Schema.Types.ObjectId, required: true },
    label: { type: String, required: true },
    customLabel: { type: String },
    direction: { type: String, enum: ['uni', 'bi'], required: true },
    createdBy: { type: String, enum: ['auto', 'user'], required: true },
    strength: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const IntelNodeSchema = new Schema<IIntelNode>({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    customType: { type: String },
    source: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String },
    url: { type: String },
    tags: { type: [String], default: [] },
    domain: { type: String },
    phase: { type: Number },
    dayN: { type: Number },
    curriculumRef: {
        sourceJson: { type: String, enum: ['projects', 'questions', 'tech-spine', 'skills', 'survival-areas'] },
        refId: { type: String }
    },
    status: { type: String, enum: ['active', 'completed', 'archived'], required: true },
    score: { type: Number },
    connections: { type: [ConnectionSchema], default: [] },
    canvasPosition: {
        x: { type: Number },
        y: { type: Number },
        z: { type: Number }
    },
    sourceRefId: { type: String }
}, {
    timestamps: true
});

// ── Indexes (P0 — Required Before Shipping) ──────────────────────
IntelNodeSchema.index({ userId: 1, createdAt: -1 });
IntelNodeSchema.index({ userId: 1, type: 1 });
IntelNodeSchema.index({ userId: 1, source: 1 });
IntelNodeSchema.index({ userId: 1, tags: 1 });
IntelNodeSchema.index({ userId: 1, status: 1, createdAt: -1 });
IntelNodeSchema.index({ userId: 1, dayN: 1 });
IntelNodeSchema.index({ userId: 1, 'curriculumRef.refId': 1 });
IntelNodeSchema.index({ userId: 1, 'connections.targetId': 1 });
// Compound for graph fetch (most critical)
IntelNodeSchema.index({ userId: 1, status: 1, 'connections.targetId': 1 });

export const IntelNode = mongoose.models.IntelNode || mongoose.model<IIntelNode>('IntelNode', IntelNodeSchema);
export default IntelNode;
