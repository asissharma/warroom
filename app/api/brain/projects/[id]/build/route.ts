import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { BuildRecord } from '@/lib/models/BuildRecord'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB()
        let record = await BuildRecord.findOne({ projectId: params.id, userId: 'default_user' }).lean()

        if (!record) {
            return NextResponse.json({
                doneMeansChecked: false,
                githubUrl: '',
                demoUrl: '',
                hours: null,
                selfScore: 0,
                whatICut: '',
                whatBroke: ''
            })
        }

        return NextResponse.json(record)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB()
        const body = await req.json()

        const record = await BuildRecord.findOneAndUpdate(
            { projectId: params.id, userId: 'default_user' },
            {
                $set: {
                    doneMeansChecked: body.doneMeansChecked,
                    githubUrl: body.githubUrl,
                    demoUrl: body.demoUrl,
                    hours: body.hours,
                    selfScore: body.selfScore,
                    whatICut: body.whatICut,
                    whatBroke: body.whatBroke
                }
            },
            { new: true, upsert: true }
        )

        return NextResponse.json({ success: true, record })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
