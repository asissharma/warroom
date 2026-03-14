import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'

// POST /api/intel/[id]/connect
// Creates a directed edge FROM [id] TO [targetId]
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB()
        const { id } = await context.params
        const { targetId, label, customLabel, strength = 1 } = await request.json()
        const userId = 'default'

        if (!targetId) {
            return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
        }

        // Check if both nodes exist
        const sourceNode = await IntelNode.findOne({ _id: id, userId })
        const targetNode = await IntelNode.findOne({ _id: targetId, userId })

        if (!sourceNode || !targetNode) {
            return NextResponse.json({ error: 'One or both nodes not found' }, { status: 404 })
        }

        // Check if connection already exists
        const exists = sourceNode.connections?.some((c: any) => c.targetId === targetId)
        if (exists) {
            return NextResponse.json({ error: 'Connection already exists' }, { status: 400 })
        }

        // Add connection to source node
        sourceNode.connections = sourceNode.connections || []
        sourceNode.connections.push({
            targetId,
            label: label || 'related_to',
            customLabel,
            direction: 'outbound',
            strength,
            createdBy: 'manual'
        })

        await sourceNode.save()

        return NextResponse.json(sourceNode)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// DELETE /api/intel/[id]/connect
// Removes an edge FROM [id] TO [targetId]
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB()
        const { id } = await context.params
        const { targetId } = await request.json()
        const userId = 'default'

        if (!targetId) {
            return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
        }

        const sourceNode = await IntelNode.findOne({ _id: id, userId })
        if (!sourceNode) {
            return NextResponse.json({ error: 'Source node not found' }, { status: 404 })
        }

        // Filter out the connection
        sourceNode.connections = sourceNode.connections.filter((c: any) => c.targetId !== targetId)
        await sourceNode.save()

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
