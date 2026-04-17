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

    const { syncStatus, syncQuestion, questionNote, refId, ...pureUpdateData } = updateData;

    // THIN LOG: We no longer save entire blocks redundantly into the session doc.
    // We only update the underlying specific target item exactly.

    const standardStatus = syncStatus === 'Done' ? 'completed' 
                         : syncStatus === 'Partial' ? 'in-progress' 
                         : syncStatus === 'Skipped' ? 'pending' 
                         : undefined;

    if (refId) {
        if (blockType === 'project') {
            const updateObj = standardStatus ? { status: standardStatus, ...pureUpdateData } : pureUpdateData;
            if (Object.keys(updateObj).length > 0) {
                 await Project.findByIdAndUpdate(refId, updateObj);
            }
        } else if (blockType === 'spine') {
            const updateObj = standardStatus ? { status: standardStatus, ...pureUpdateData } : pureUpdateData;
            // Map simple fields from ui "topicToday" (legacy) -> topic if needed, but normally frontend sends exact updates, wait actually frontend sends 'microtaskToday'. We should map it back to `microtask` if provided!
            if (updateObj.microtaskToday !== undefined) updateObj.microtask = updateObj.microtaskToday;
            if (Object.keys(updateObj).length > 0) {
                 await TechSpine.findByIdAndUpdate(refId, updateObj);
            }
        } else if (blockType === 'softSkill' || blockType === 'payableSkill') {
            const updateObj = standardStatus ? { status: standardStatus, ...pureUpdateData } : pureUpdateData;
            if (Object.keys(updateObj).length > 0) {
                 await Skill.findByIdAndUpdate(refId, updateObj);
            }
        }
    }

    if (blockType === 'questions' && syncQuestion?.id) {
        const questionDoc = await Question.findById(syncQuestion.id);
        if (questionDoc) {
            // Include daily result tracking dynamically
            questionDoc.lastReviewedDate = new Date();
            if (syncQuestion.status === 'Correct' || syncQuestion.status === 'Struggled') {
                questionDoc.lastReviewResult = syncQuestion.status;
            }

            // SM-2 Update Logic
            if (syncQuestion.status === 'Undo') {
                questionDoc.status = 'learning';
                questionDoc.repetitions = 0;
                questionDoc.interval = 1;
                questionDoc.lastReviewResult = 'Undo'; // Or clear it
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

    // Still touch session merely to bump updatedAt to keep it hot, though optional
    await Session.updateOne({ _id: sessionId }, { $set: { updatedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Block Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
