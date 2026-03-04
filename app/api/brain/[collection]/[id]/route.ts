// app/api/brain/[collection]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CollectionKey, COLLECTIONS } from '@/lib/brain/collections'
import { getRow } from '@/lib/brain/reader'

export const dynamic = 'force-dynamic'

export async function GET(
    _req: NextRequest,
    { params }: { params: { collection: string; id: string } }
) {
    const key = params.collection as CollectionKey
    if (!COLLECTIONS[key]) {
        return NextResponse.json({ error: 'Unknown collection' }, { status: 404 })
    }

    try {
        const row = getRow(key, params.id)
        if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(row)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
