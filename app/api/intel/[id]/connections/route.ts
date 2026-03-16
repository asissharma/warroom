import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB()
        const node = await IntelNode.findById(params.id).lean() as any
        
        if (!node) {
            return NextResponse.json({ error: 'Node not found' }, { status: 404 })
        }

        if (!node.connections || node.connections.length === 0) {
            return NextResponse.json([])
        }

        // Fetch full documents for all connected IDs
        const connections = await IntelNode.find({
            _id: { $in: node.connections }
        }).select('title type dayN createdAt').lean()

        return NextResponse.json(connections)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
