import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import GapTracker from '@/app/lib/models/GapTracker';
import Capture from '@/app/lib/models/Capture';
import Question from '@/app/lib/models/Question';
import TechSpine from '@/app/lib/models/TechSpine';
import Project from '@/app/lib/models/Project';
import Skill from '@/app/lib/models/Skill';

export async function GET() {
  await connectDB();
  
  // Use local timezone date string
  const today = new Date().toISOString().split('T')[0];

  try {
    let session = await Session.findOne({ date: today }).populate('gapsFlagged captures');
    
    if (!session) {
      // Find latest session to get the day number
      const lastSession = await Session.findOne().sort({ dayNumber: -1 });
      const nextDay = lastSession ? lastSession.dayNumber + 1 : 1;
      
      // Load highest severity open gap
      const criticalGap = await GapTracker.findOne({ status: 'open', severity: 'critical' }).sort({ flagCount: -1 });
      const mediumGap = await GapTracker.findOne({ status: 'open', severity: 'medium' }).sort({ flagCount: -1 });
      const highestGap = criticalGap || mediumGap;

      let survivalBlock = undefined;
      if (highestGap) {
        survivalBlock = {
          status: 'NotStarted',
          gapName: highestGap.concept,
          severity: highestGap.severity,
          flagCount: highestGap.flagCount,
          daysSinceOpen: Math.floor((new Date().getTime() - highestGap.createdAt.getTime()) / (1000 * 3600 * 24))
        };
      }

      // Load DB Questions natively via SM-2 bounds
      let dueQuestions = await Question.find({ 
          status: { $in: ['learning', 'review'] }, 
          nextReviewDate: { $lte: new Date() } 
      }).limit(9);
      
      if (dueQuestions.length < 9) {
          const extra = await Question.find({ status: 'unseen' }).limit(9 - dueQuestions.length);
          dueQuestions = dueQuestions.concat(extra);
      }

      const formattedQuestions = dueQuestions.map(q => ({
          id: q._id.toString(),
          text: q.text,
          theme: q.theme
      }));

      // Find DB Tracks (In-Progress roll over first, else get Next Pending)
      let spine = await TechSpine.findOne({ status: 'in-progress' });
      if (!spine) spine = await TechSpine.findOne({ status: 'pending' }).sort({ order: 1 });

      let softSkill = await Skill.findOne({ type: 'soft', status: 'in-progress' });
      if (!softSkill) softSkill = await Skill.findOne({ type: 'soft', status: 'pending' }).sort({ order: 1 });
      
      let payableSkill = await Skill.findOne({ type: 'payable', status: 'in-progress' });
      if (!payableSkill) payableSkill = await Skill.findOne({ type: 'payable', status: 'pending' }).sort({ order: 1 });

      let project = await Project.findOne({ status: 'in-progress' });
      if (!project) project = await Project.findOne({ status: 'pending' }).sort({ order: 1 });

      session = await Session.create({
        dayNumber: nextDay,
        phase: spine?.phase || 'Foundation',
        date: today,
        blocks: {
          spine: spine ? {
            status: spine.status === 'in-progress' ? 'Partial' : 'NotStarted',
            refId: spine._id,
            area: spine.area,
            topicToday: spine.topic,
            microtaskToday: spine.microtask,
            resource: spine.resource
          } : undefined,
          softSkill: softSkill ? {
            status: softSkill.status === 'in-progress' ? 'Partial' : 'NotStarted',
            refId: softSkill._id,
            skillName: softSkill.name,
            prompt: softSkill.prompt,
            isDone: false
          } : undefined,
          payableSkill: payableSkill ? {
            status: payableSkill.status === 'in-progress' ? 'Partial' : 'NotStarted',
            refId: payableSkill._id,
            topicName: payableSkill.name,
            chapter: payableSkill.chapter,
            prompt: payableSkill.prompt,
            isDone: false
          } : undefined,
          survival: survivalBlock,
          questions: { status: 'NotStarted', total: formattedQuestions.length, correct: 0, struggled: 0, items: formattedQuestions },
          project: project ? {
            status: project.status === 'in-progress' ? 'Partial' : 'NotStarted',
            refId: project._id,
            projectName: project.name,
            description: project.description
          } : undefined
        },
        momentumScore: 0,
        gapsFlagged: [],
        captures: [],
        honestNote: '',
        tomorrowFocus: ''
      });
    }

    // Determine Carry Forward items (From past sessions)
    const pastSessions = await Session.find({ dayNumber: { $lt: session.dayNumber } })
      .sort({ dayNumber: -1 })
      .limit(3);

    const carryForwardItems: any[] = [];
    pastSessions.forEach(ps => {
      if (ps.blocks?.project?.status === 'Partial' || ps.blocks?.project?.status === 'Skipped') {
        carryForwardItems.push({ 
          type: 'project', 
          name: ps.blocks.project.projectName, 
          status: ps.blocks.project.status,
          date: ps.date
        });
      }
    });

    return NextResponse.json({ session, carryForwardItems });
  } catch (error: any) {
    console.error('Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
