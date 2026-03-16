import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { WeeklyDigest } from '@/lib/models/WeeklyDigest'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const weekParam = searchParams.get('week')
        
        if (weekParam) {
            const week = parseInt(weekParam, 10)
            const digest = await WeeklyDigest.findOne({ weekNumber: week }).lean()
            if (!digest) {
                return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
            }
            return NextResponse.json(digest)
        }

        // Return all digests for historical view
        const digests = await WeeklyDigest.find({}).sort({ weekNumber: -1 }).lean()
        return NextResponse.json(digests)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}