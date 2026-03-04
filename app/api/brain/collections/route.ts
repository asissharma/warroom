// app/api/brain/collections/route.ts
import { NextResponse } from 'next/server'
import { COLLECTION_ORDER, COLLECTIONS } from '@/lib/brain/collections'
import { getCollectionCount } from '@/lib/brain/reader'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const data = COLLECTION_ORDER.map(key => {
            const cfg = COLLECTIONS[key]
            return {
                key,
                label: cfg.label,
                emoji: cfg.emoji,
                colorBase: cfg.colorBase,
                colorMuted: cfg.colorMuted,
                description: cfg.description,
                count: getCollectionCount(key),
            }
        })
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
