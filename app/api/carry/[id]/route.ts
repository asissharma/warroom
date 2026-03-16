import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { CarryForward } from '@/lib/models/CarryForward'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const { id } = await params
        const body = await request.json()
        const { action } = body

        const carryTask = await CarryForward.findById(id)
        if (!carryTask) {
            return NextResponse.json({ error: 'Carry task not found' }, { status: 404 })
        }

        if (action === 'skip') {
            // Increment timesSkipped and update toDayN to current day + 1
            const userId = carryTask.userId
            const currentDayN = carryTask.toDayN
            const nextDayN = currentDayN + 1

            await CarryForward.findByIdAndUpdate(id, {
                $inc: { timesSkipped: 1 },
                $set: { toDayN: nextDayN }
            })

            return NextResponse.json({ success: true, action: 'skipped', newDayN: nextDayN })
        }

        if (action === 'resolve') {
            // Mark as resolved
            await CarryForward.findByIdAndUpdate(id, {
                $set: { resolved: true, resolvedAt: new Date() }
            })

            return NextResponse.json({ success: true, action: 'resolved' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('API /carry/[id] PATCH error:', error)
        return NextResponse.json({ error: 'Failed to update carry task' }, { status: 500 })
    }
}