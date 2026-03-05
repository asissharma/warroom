import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TopicStatus } from '@/lib/models/TopicStatus'

export async function GET(request: Request) {
    try {
        await connectDB()
        const userId = 'default'
        const statuses = await TopicStatus.find({ userId })
        return NextResponse.json(statuses)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const topicKey = searchParams.get('topicKey')
        const body = await request.json()
        const userId = 'default'

        if (!topicKey || !body.status) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        const record = await TopicStatus.findOneAndUpdate(
            { userId, topicKey },
            { $set: { status: body.status } },
            { upsert: true, new: true }
        )

        return NextResponse.json(record)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
