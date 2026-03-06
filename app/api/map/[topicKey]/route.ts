import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelRecord } from '@/lib/models/IntelRecord'
import { TopicStatus } from '@/lib/models/TopicStatus'
import { ShadowInsight } from '@/lib/models/ShadowInsight'
import { SpineEntryModel } from '@/lib/models/SpineEntry'
import { QuestionModel } from '@/lib/models/Question'
import { CourseModel } from '@/lib/models/Course'
import { SurvivalAreaModel } from '@/lib/models/SurvivalArea'

export async function GET(request: Request, context: { params: Promise<{ topicKey: string }> }) {
    try {
        await connectDB()
        const userId = 'default'
        const { topicKey } = await context.params

        const decodedTopicKey = decodeURIComponent(topicKey)

        // 1. Get INTEL logs for this topic
        const intelFeed = await IntelRecord.find({ userId, topicKey: decodedTopicKey }).sort({ createdAt: -1 }).lean()

        // 2. Get status for this topic
        const statusRecord = await TopicStatus.findOne({ userId, topicKey: decodedTopicKey }).lean() as any
        const status = statusRecord?.status || 'not_started'

        // Find the spine entry to get the area
        const spineEntry = await SpineEntryModel.findOne({ topicKeys: decodedTopicKey }).lean() as any
        const area = spineEntry?.area || 'General'

        // 3. Get generic matching questions from DB
        const questions = await QuestionModel.find({
            $or: [
                { question: { $regex: decodedTopicKey, $options: 'i' } },
                { theme: { $regex: decodedTopicKey, $options: 'i' } },
                { theme: { $regex: area, $options: 'i' } }
            ]
        }).limit(5).lean()

        // 4. Get matching resources from DB (Courses + Survival)
        const courses = await CourseModel.find({
            $or: [
                { area: { $regex: area, $options: 'i' } },
                { name: { $regex: decodedTopicKey, $options: 'i' } }
            ]
        }).limit(3).lean()

        const survivalAreas = await SurvivalAreaModel.find({
            'topics.connectedTopicKeys': decodedTopicKey
        }).lean() as any[]

        const survivalResources = survivalAreas.flatMap(a => a.resources || [])

        const resources = [
            ...courses.map((c: any) => ({ name: c.name, author: c.provider, url: c.url, free: false })),
            ...survivalResources
        ].slice(0, 5)

        // 5. Get ShadowInsight if it exists
        const shadow = await ShadowInsight.findOne({ userId, topicKey: decodedTopicKey }).lean()

        // 6. Trigger /api/shadow/connect in the background to update connections
        fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/shadow/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topicKey: decodedTopicKey })
        }).catch(err => console.error('Failed to trigger connection analysis', err))

        return NextResponse.json({
            topicKey: decodedTopicKey,
            status,
            intelFeed,
            questions,
            resources,
            shadow
        })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
