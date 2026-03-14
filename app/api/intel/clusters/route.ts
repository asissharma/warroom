import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'

export async function GET(request: Request) {
    try {
        await connectDB()
        const userId = 'default' // TODO: implement real auth later
        const { searchParams } = new URL(request.url)
        const limitParam = parseInt(searchParams.get('limit') || '100') // How many top tags to show

        // Aggregate to find the most common tags
        const topTagsAgg = await IntelNode.aggregate([
            { $match: { userId } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limitParam }
        ])

        const topTags = topTagsAgg.map(t => t._id)

        // Fetch nodes for those top tags
        const nodes = await IntelNode.find({
            userId,
            tags: { $in: topTags }
        }).sort({ createdAt: -1 }).lean()

        // Cluster nodes by tag
        const clusters: Record<string, any[]> = {}
        
        topTags.forEach(tag => {
            clusters[tag] = nodes.filter(n => n.tags.includes(tag))
        })

        return NextResponse.json({
            tags: topTagsAgg.map(t => ({ tag: t._id, count: t.count })),
            clusters
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
