// app/api/brain/[collection]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CollectionKey, COLLECTIONS } from '@/lib/brain/collections'
import { readCollection, filterRows } from '@/lib/brain/reader'

export const dynamic = 'force-dynamic'

export async function GET(
    req: NextRequest,
    { params }: { params: { collection: string } }
) {
    const key = params.collection as CollectionKey

    if (!COLLECTIONS[key]) {
        return NextResponse.json({ error: 'Unknown collection' }, { status: 404 })
    }

    try {
        const url = new URL(req.url)
        const filterParams: Record<string, string> = {}
        url.searchParams.forEach((v, k) => { filterParams[k] = v })

        const page = parseInt(filterParams.page ?? '1')
        const limit = parseInt(filterParams.limit ?? '100')
        delete filterParams.page
        delete filterParams.limit

        const all = readCollection(key)
        const filtered = filterRows(all, filterParams)
        const total = filtered.length
        const start = (page - 1) * limit
        const rows = filtered.slice(start, start + limit)

        return NextResponse.json({ rows, total, page, limit })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
