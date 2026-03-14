import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'
import { emitToIntel } from '@/lib/intelEmitter'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = 'default' // TODO: implement real auth later

        const type = searchParams.get('type')
        const source = searchParams.get('source')
        const tags = searchParams.get('tags') // comma-separated
        const domain = searchParams.get('domain')
        const status = searchParams.get('status')
        const dayN = searchParams.get('dayN')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        // Build query
        const query: any = { userId }
        if (type) query.type = type
        if (source) query.source = source
        if (domain) query.domain = domain
        if (status) query.status = status
        if (dayN) query.dayN = parseInt(dayN)
        
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim().toLowerCase())
            query.tags = { $all: tagArray }
        }

        const skip = (page - 1) * limit
        const total = await IntelNode.countDocuments(query)
        const records = await IntelNode.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

        return NextResponse.json({
            data: records,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const userId = 'default'

        // Direct manual input creation - uses emitter logic to handle tags and connections
        const record = await emitToIntel({
            ...body,
            userId,
            source: 'manual',
            status: body.status || 'completed'
        })

        return NextResponse.json(record)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
