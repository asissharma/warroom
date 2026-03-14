import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = 'default' // TODO: implement real auth later
        
        // Fetch all REAL nodes for this user to pass to BrainCanvas
        // BrainCanvas is responsible for computing ghost nodes
        const nodes = await IntelNode.find({ userId }).lean()

        // Extract connections (edges) from the nodes
        const edges = nodes.flatMap(node => 
            (node.connections || []).map((conn: any) => ({
                id: `edge_${String(node._id)}_${String(conn.targetId)}`,
                sourceId: String(node._id),
                targetId: String(conn.targetId),
                label: conn.label,
                customLabel: conn.customLabel,
                direction: conn.direction,
                strength: conn.strength,
                createdBy: conn.createdBy
            }))
        )

        return NextResponse.json({
            nodes,
            edges
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
