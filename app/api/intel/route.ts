import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelRecord } from '@/lib/models/IntelRecord'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = 'default' // TODO: implement real auth later

        const topic = searchParams.get('topic')
        const limitParam = searchParams.get('limit')
        const limit = limitParam ? parseInt(limitParam) : 50

        const query: any = { userId }
        if (topic) query.topicKey = topic

        const records = await IntelRecord.find(query).sort({ createdAt: -1 }).limit(limit)
        return NextResponse.json(records)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const userId = 'default'

        const record = await IntelRecord.create({
            ...body,
            userId
        })

        // Fire and forget synthesis
        fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/shadow/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topicKey: body.topicKey, intelRecord: record })
        }).catch(err => console.error('Failed to trigger synthesis', err))

        return NextResponse.json(record)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
