import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { CourseModel } from '@/lib/models/Course'

export async function GET() {
    try {
        await connectDB()
        const courses = await CourseModel.find({}).lean()
        return NextResponse.json(courses)
    } catch (error) {
        console.error('API /courses GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
}