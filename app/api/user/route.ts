import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || 'default'

        let user = await User.findOne({ userId }).lean()

        if (!user) {
            user = await User.create({ userId, startDate: new Date() })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('API /user GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const { userId = 'default', startDate, preferences } = body

        const updateObj: any = {}
        if (startDate) updateObj.startDate = new Date(startDate)
        if (preferences) updateObj.preferences = { ...preferences }

        const user = await User.findOneAndUpdate(
            { userId },
            { $set: updateObj },
            { new: true, upsert: true }
        ).lean()

        return NextResponse.json(user)
    } catch (error) {
        console.error('API /user PATCH error:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}
