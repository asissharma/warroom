import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SkillProgress } from '@/lib/models/SkillProgress'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || 'default'

        const skills = await SkillProgress.find({ userId }).lean() as unknown as any[]
        const skillBars = skills.reduce((acc: any, skill: any) => {
            acc[skill.barKey] = { value: skill.value, level: skill.level }
            return acc
        }, {})

        // Ensure all 5 exist with defaults if missing
        const keys = ['python_algo_oop', 'databases_concurrency', 'js_node_security', 'ml_ai_mlops', 'build_output']
        keys.forEach(k => {
            if (!skillBars[k]) {
                skillBars[k] = { value: 0, level: 1 }
            }
        })

        return NextResponse.json(skillBars)
    } catch (error) {
        console.error('API /skill GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch skill progress' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB()
        const { userId = 'default', barKey, increment } = await request.json()

        if (!barKey || typeof increment !== 'number') {
            return NextResponse.json({ error: 'Missing barKey or increment' }, { status: 400 })
        }

        const currentSkill = await SkillProgress.findOne({ userId, barKey }).lean() as any
        const currentVal = currentSkill?.value || 0

        const newValue = Math.min(100, Math.max(0, currentVal + increment))
        const newLevel = Math.min(10, Math.floor(newValue / 10) + 1)

        const updated = await SkillProgress.findOneAndUpdate(
            { userId, barKey },
            { $set: { value: newValue, level: newLevel, lastUpdated: new Date() } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean() as any

        return NextResponse.json({ barKey, value: updated.value, level: updated.level })
    } catch (error) {
        console.error('API /skill PATCH error:', error)
        return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
    }
}
