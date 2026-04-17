import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import GapTracker from '@/app/lib/models/GapTracker';
import Capture from '@/app/lib/models/Capture';
import Question from '@/app/lib/models/Question';
import TechSpine from '@/app/lib/models/TechSpine';
import Project from '@/app/lib/models/Project';
import Skill from '@/app/lib/models/Skill';

async function getDailyBlock(Model: any, queryExtras = {}) {
    // Determine the active item according to Thin-Log logic
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. If one was completed today, show it as Done today
    let doc = await Model.findOne({ ...queryExtras, status: 'completed', updatedAt: { $gte: startOfToday } });
    if (doc) return { doc, dailyStatus: 'Done' };

    // 2. Otherwise get the currently active item
    doc = await Model.findOne({ ...queryExtras, status: 'in-progress' });
    if (doc) return { doc, dailyStatus: 'Partial' };

    // 3. Otherwise get the next pending item
    doc = await Model.findOne({ ...queryExtras, status: 'pending' }).sort({ order: 1 });
    if (doc) return { doc, dailyStatus: 'NotStarted' };

    return null;
}

export async function GET() {
  await connectDB();
  
  // Use local timezone date string
  const today = new Date().toISOString().split('T')[0];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    let session = await Session.findOne({ date: today }).populate([
      { path: 'gapsFlagged', model: GapTracker },
      { path: 'captures', model: Capture }
    ]);
    
    if (!session) {
      const lastSession = await Session.findOne().sort({ dayNumber: -1 });
      const nextDay = lastSession ? lastSession.dayNumber + 1 : 1;

      // Create session as a thin wrapper without storing blocks
      session = await Session.create({
        dayNumber: nextDay,
        phase: 'Foundation',
        date: today,
        momentumScore: 0,
        gapsFlagged: [],
        captures: [],
        honestNote: '',
        tomorrowFocus: ''
      });
    }

    // ==========================================
    // THIN-LOG: Dynamically construct daily blocks
    // ==========================================
    const dynamicBlocks: any = {};

    // 1. TechSpine
    const spineObj = await getDailyBlock(TechSpine);
    if (spineObj) {
      dynamicBlocks.spine = {
        status: spineObj.dailyStatus,
        refId: spineObj.doc._id,
        area: spineObj.doc.area,
        topicToday: spineObj.doc.topic,
        microtaskToday: spineObj.doc.microtask,
        resource: spineObj.doc.resource
      };
      if (session.phase !== spineObj.doc.phase) {
          session.phase = spineObj.doc.phase || 'Foundation';
          await session.save();
      }
    }

    // 2. SoftSkill
    const softSkillObj = await getDailyBlock(Skill, { type: 'soft' });
    if (softSkillObj) {
      dynamicBlocks.softSkill = {
        status: softSkillObj.dailyStatus,
        refId: softSkillObj.doc._id,
        skillName: softSkillObj.doc.name,
        prompt: softSkillObj.doc.prompt,
        isDone: softSkillObj.dailyStatus === 'Done'
      };
    }

    // 3. PayableSkill
    const payableSkillObj = await getDailyBlock(Skill, { type: 'payable' });
    if (payableSkillObj) {
      dynamicBlocks.payableSkill = {
        status: payableSkillObj.dailyStatus,
        refId: payableSkillObj.doc._id,
        topicName: payableSkillObj.doc.name,
        chapter: payableSkillObj.doc.chapter,
        prompt: payableSkillObj.doc.prompt,
        isDone: payableSkillObj.dailyStatus === 'Done'
      };
    }

    // 4. Project
    const projectObj = await getDailyBlock(Project);
    if (projectObj) {
      dynamicBlocks.project = {
        status: projectObj.dailyStatus,
        refId: projectObj.doc._id,
        projectName: projectObj.doc.name,
        description: projectObj.doc.description
      };
    }

    // 5. Survival Block (Highest Open Gap)
    const criticalGap = await GapTracker.findOne({ status: 'open', severity: 'critical' }).sort({ flagCount: -1 });
    const mediumGap = await GapTracker.findOne({ status: 'open', severity: 'medium' }).sort({ flagCount: -1 });
    const highestGap = criticalGap || mediumGap;
    if (highestGap) {
      dynamicBlocks.survival = {
        status: 'NotStarted', // Or dynamically track Gap resolution today if needed
        gapName: highestGap.concept,
        severity: highestGap.severity,
        flagCount: highestGap.flagCount,
        daysSinceOpen: Math.floor((new Date().getTime() - highestGap.createdAt.getTime()) / (1000 * 3600 * 24))
      };
    }

    // 6. Memory Check (Questions)
    let questionsToday = await Question.find({ lastReviewedDate: { $gte: startOfToday } });
    let unreviewedDueQuestions = await Question.find({ 
        status: { $in: ['learning', 'review'] }, 
        nextReviewDate: { $lte: new Date() },
        _id: { $nin: questionsToday.map(q => q._id) }
    }).limit(9 - questionsToday.length);
    
    let combinedQuestions = [...questionsToday, ...unreviewedDueQuestions];

    if (combinedQuestions.length < 9) {
        const extra = await Question.find({ 
            status: 'unseen',
            _id: { $nin: combinedQuestions.map(q => q._id) }
        }).limit(9 - combinedQuestions.length);
        combinedQuestions = combinedQuestions.concat(extra);
    }

    let correct = 0;
    let struggled = 0;

    const formattedQuestions = combinedQuestions.map(q => {
        let qStatus = 'Pending';
        if (q.lastReviewedDate && q.lastReviewedDate >= startOfToday) {
            if (q.lastReviewResult === 'Correct') { qStatus = 'Correct'; correct++; }
            else if (q.lastReviewResult === 'Struggled') { qStatus = 'Struggled'; struggled++; }
        }

        return {
            id: q._id.toString(),
            text: q.text,
            theme: q.theme,
            status: qStatus
        };
    });

    dynamicBlocks.questions = {
        status: (correct + struggled === formattedQuestions.length && formattedQuestions.length > 0) ? 'Done' : (correct + struggled > 0 ? 'Partial' : 'NotStarted'),
        total: formattedQuestions.length,
        correct,
        struggled,
        items: formattedQuestions
    };

    // Construct the response session
    const responseSession = {
      ...session.toObject(),
      blocks: dynamicBlocks
    };

    // Determine Carry Forward items
    const pastSessions = await Session.find({ dayNumber: { $lt: session.dayNumber } })
      .sort({ dayNumber: -1 })
      .limit(3);

    const carryForwardItems: any[] = [];
    pastSessions.forEach(ps => {
      // Because we used to save blocks in Session, legacy items might still be read
      if (ps.blocks?.project?.status === 'Partial' || ps.blocks?.project?.status === 'Skipped') {
        carryForwardItems.push({ 
          type: 'project', 
          name: ps.blocks.project.projectName, 
          status: ps.blocks.project.status,
          date: ps.date
        });
      }
    });

    return NextResponse.json({ session: responseSession, carryForwardItems });
  } catch (error: any) {
    console.error('Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
