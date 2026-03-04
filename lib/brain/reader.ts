// lib/brain/reader.ts
// Reads and normalizes all 7 JSON data sources into uniform row arrays.
// Merges computed fields (skill clusters, syllabus book counts, etc.)

import path from 'path'
import fs from 'fs'
import { CollectionKey, getSkillCluster } from './collections'

const DATA_DIR = path.join(process.cwd(), 'data')

function readJSON(file: string): any {
    const fullPath = path.join(DATA_DIR, file)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    return JSON.parse(raw)
}

export interface NormalizedRow {
    _id: string           // stable string ID for routing
    [key: string]: any
}

export function readCollection(key: CollectionKey): NormalizedRow[] {
    switch (key) {
        case 'questions': {
            const rows = readJSON('questions.json') as any[]
            return rows.map(q => ({
                ...q,
                _id: String(q.id),
                difficulty: q.difficulty,    // 1=Easy, 2=Med, 3=Hard
            }))
        }

        case 'projects': {
            const rows = readJSON('projects.json') as any[]
            return rows.map(p => ({
                ...p,
                _id: String(p.day),
            }))
        }

        case 'syllabus': {
            const data = readJSON('skills.json')
            const payable = data.payable as any[]
            return payable.map((s, i) => ({
                ...s,
                _id: String(i),
                coreBooks: s.coreBooks?.length ?? 0,  // show count in table
                _booksRaw: s.coreBooks,               // keep original for detail view
            }))
        }

        case 'skills': {
            const data = readJSON('skills.json')
            const basic = data.basic as string[]
            return basic.map((name, i) => ({
                _id: String(i),
                _idx: i + 1,
                name,
                cluster: getSkillCluster(i),
            }))
        }

        case 'spine': {
            const rows = readJSON('tech-spine.json') as any[]
            return rows.map(s => ({
                ...s,
                _id: String(s.id),
                topics: s.topics?.length ?? 0,         // count for table
                _topicsRaw: s.topics,
                microtasks: s.microtasks?.length ?? 0,
                _microtasksRaw: s.microtasks,
            }))
        }

        case 'courses': {
            const rows = readJSON('courses.json') as any[]
            return rows.map(c => ({
                ...c,
                _id: String(c.id),
            }))
        }

        case 'survival': {
            const rows = readJSON('survival-areas.json') as any[]
            return rows.map(s => ({
                ...s,
                _id: String(s.id),
                topics: s.topics?.length ?? 0,
                _topicsRaw: s.topics,
                resources: s.resources?.length ?? 0,
                _resourcesRaw: s.resources,
            }))
        }

        default:
            return []
    }
}

export function getCollectionCount(key: CollectionKey): number {
    try {
        return readCollection(key).length
    } catch {
        return 0
    }
}

export function getRow(key: CollectionKey, id: string): NormalizedRow | null {
    const rows = readCollection(key)
    return rows.find(r => r._id === id) ?? null
}

// Apply search + filter params to a row array
export function filterRows(
    rows: NormalizedRow[],
    params: { q?: string;[key: string]: string | undefined }
): NormalizedRow[] {
    let result = rows

    // Text search across all string fields
    if (params.q) {
        const q = params.q.toLowerCase()
        result = result.filter(row =>
            Object.values(row).some(v =>
                typeof v === 'string' && v.toLowerCase().includes(q)
            )
        )
    }

    // Field-specific filters
    for (const [k, v] of Object.entries(params)) {
        if (k === 'q' || !v) continue
        result = result.filter(row => {
            const val = row[k]
            if (val === undefined || val === null) return false
            return String(val).toLowerCase() === v.toLowerCase()
        })
    }

    return result
}
