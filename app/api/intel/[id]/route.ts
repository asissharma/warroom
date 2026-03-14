import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'

// PATCH /api/intel/[id]
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB()
        const { id } = await context.params
        const body = await request.json()
        const userId = 'default'

        // Only allow updating certain fields to prevent overwriting core state
        const updateData: any = {}
        if (body.title !== undefined) updateData.title = body.title
        if (body.body !== undefined) updateData.body = body.body
        if (body.tags !== undefined) updateData.tags = body.tags
        if (body.status !== undefined) updateData.status = body.status
        if (body.domain !== undefined) updateData.domain = body.domain

        const updated = await IntelNode.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        )

        if (!updated) {
            return NextResponse.json({ error: 'Node not found' }, { status: 404 })
        }

        return NextResponse.json(updated)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// DELETE /api/intel/[id]
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB()
        const { id } = await context.params
        const userId = 'default'

        const deleted = await IntelNode.findOneAndDelete({ _id: id, userId })
        
        if (!deleted) {
            return NextResponse.json({ error: 'Node not found' }, { status: 404 })
        }

        // Optional: Remove connections to this node from other nodes
        await IntelNode.updateMany(
            { userId, 'connections.targetId': id },
            { $pull: { connections: { targetId: id } } }
        )

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
