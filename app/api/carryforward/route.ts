import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { CarryForward } from '@/lib/models/CarryForward'

export async function DELETE(request: Request) {
    try {
        await connectDB()
        const { userId = 'default' } = await request.json()

        const now = new Date()
        const result = await CarryForward.updateMany(
            { userId, resolved: false },
            { $set: { resolved: true, resolvedAt: now } }
        )

        return NextResponse.json({ cleared: result.modifiedCount })
    } catch (error) {
        console.error('API /carryforward DELETE error:', error)
        return NextResponse.json({ error: 'Failed to clear carry forwards' }, { status: 500 })
    }
}
