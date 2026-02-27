import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { LogRecord } from '@/lib/models/LogRecord'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || 'default'
        const limit = parseInt(searchParams.get('limit') || '50', 10)
        const type = searchParams.get('type') || 'all'

        const query: any = { userId }
        if (type !== 'all') {
            query.type = type
        }

        const logs = await LogRecord.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()

        return NextResponse.json(logs)
    } catch (error) {
        console.error('API /log GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const { userId = 'default', text, type, dayN } = await request.json()

        if (!text || !type || !dayN) {
            return NextResponse.json({ error: 'Missing text, type, or dayN' }, { status: 400 })
        }

        const log = await LogRecord.create({ userId, text, type, dayN })

            // Asynchronously prune to keep DB fast
            ; (LogRecord as any).pruneOldest(userId).catch(console.error)

        return NextResponse.json(log)
    } catch (error) {
        console.error('API /log POST error:', error)
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }
}
