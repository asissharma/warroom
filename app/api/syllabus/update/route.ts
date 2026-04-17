import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import TechSpine from '@/app/lib/models/TechSpine';
import Skill from '@/app/lib/models/Skill';
import Question from '@/app/lib/models/Question';
import GapTracker from '@/app/lib/models/GapTracker';

export async function PUT(request: Request) {
  await connectDB();
  
  try {
    const { source, refId, updateData } = await request.json();

    if (!source || !refId || !updateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes provided' });
    }

    if (source === 'spine') {
      await TechSpine.findByIdAndUpdate(refId, updateData);
    } else if (source === 'projects') {
      await Project.findByIdAndUpdate(refId, updateData);
    } else if (source === 'soft_skills' || source === 'payable_skills') {
      await Skill.findByIdAndUpdate(refId, updateData);
    } else if (source === 'questions') {
      await Question.findByIdAndUpdate(refId, updateData);
    } else if (source === 'gaps' || source === 'survival') {
      await GapTracker.findByIdAndUpdate(refId, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Syllabus Item Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
