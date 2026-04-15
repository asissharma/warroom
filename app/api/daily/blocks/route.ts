import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import Project from '@/app/lib/models/Project';
import TechSpine from '@/app/lib/models/TechSpine';
import Skill from '@/app/lib/models/Skill';
import Question from '@/app/lib/models/Question';

export async function PUT(request: Request) {
  await connectDB();
  
  try {
    const { sessionId, blockType, updateData } = await request.json();

    if (!sessionId || !blockType || !updateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentBlockData = session.blocks[blockType];
    const { syncStatus, syncQuestion, questionNote, ...pureUpdateData } = updateData;

    // 1. Build the updated block — merge pure field updates first
    const updatedBlock: any = { ...currentBlockData, ...pureUpdateData };

    // 2. If this is a question update, apply status + note BEFORE the save
    if (blockType === 'questions' && (syncQuestion?.id || questionNote?.id)) {
        const qItems: any[] = [...(updatedBlock.items || [])];

        // Apply answer status
        if (syncQuestion?.id) {
            const idx = qItems.findIndex((q: any) => q.id === syncQuestion.id);
            if (idx !== -1 && qItems[idx].status !== 'Correct' && qItems[idx].status !== 'Struggled') {
                qItems[idx] = { ...qItems[idx], status: syncQuestion.status };
                if (syncQuestion.status === 'Correct') {
                    updatedBlock.correct = (updatedBlock.correct || 0) + 1;
                } else if (syncQuestion.status === 'Struggled') {
                    updatedBlock.struggled = (updatedBlock.struggled || 0) + 1;
                }
            }
        }

        // Apply per-question note
        if (questionNote?.id) {
            const idx = qItems.findIndex((q: any) => q.id === questionNote.id);
            if (idx !== -1) {
                qItems[idx] = { ...qItems[idx], note: questionNote.note };
            }
        }

        updatedBlock.items = qItems;
    }

    // 3. Write back to session — single save
    session.blocks = { ...session.blocks, [blockType]: updatedBlock };
    session.markModified('blocks');
    await session.save();

    // 4. Synchronization Subroutines (Dual-Write to source collections — separate from session save)
    if (syncStatus && currentBlockData?.refId) {
        const standardStatus = syncStatus === 'Done' ? 'completed' 
                             : syncStatus === 'Partial' ? 'in-progress' 
                             : syncStatus === 'Skipped' ? 'pending' 
                             : 'pending';

        if (blockType === 'project') {
            await Project.findByIdAndUpdate(currentBlockData.refId, { status: standardStatus });
        } else if (blockType === 'spine') {
            await TechSpine.findByIdAndUpdate(currentBlockData.refId, { status: standardStatus });
        } else if (blockType === 'softSkill' || blockType === 'payableSkill') {
            await Skill.findByIdAndUpdate(currentBlockData.refId, { status: standardStatus });
        }
    }

    if (blockType === 'questions' && syncQuestion?.id) {
        const questionDoc = await Question.findById(syncQuestion.id);
        if (questionDoc) {
            // SM-2 Update Logic (unchanged but ensured it runs)
            if (syncQuestion.status === 'Undo') {
                questionDoc.status = 'learning';
                questionDoc.repetitions = 0;
                questionDoc.interval = 1;
            } else if (syncQuestion.status === 'Correct') {
                if (questionDoc.status === 'unseen') {
                    questionDoc.status = 'learning';
                    questionDoc.interval = 1;
                } else if (questionDoc.status === 'learning' || questionDoc.status === 'review') {
                    questionDoc.repetitions += 1;
                    if (questionDoc.repetitions >= 2) {
                        questionDoc.status = 'review';
                        questionDoc.interval = Math.round(questionDoc.interval * questionDoc.easeFactor);
                        questionDoc.easeFactor = Math.min(2.5, questionDoc.easeFactor + 0.1);
                    }
                }
                if (questionDoc.repetitions > 4) {
                    questionDoc.status = 'retired';
                }
            } else if (syncQuestion.status === 'Struggled') {
                questionDoc.status = 'learning';
                questionDoc.repetitions = 0;
                questionDoc.interval = 1;
                questionDoc.easeFactor = Math.max(1.3, questionDoc.easeFactor - 0.2);
            }
            
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + questionDoc.interval);
            questionDoc.nextReviewDate = nextReview;

            await questionDoc.save();
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Block Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
