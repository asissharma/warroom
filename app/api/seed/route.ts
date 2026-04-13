import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import mongoose from 'mongoose';

// Models
import Question from '@/app/lib/models/Question';
import TechSpine from '@/app/lib/models/TechSpine';
import Project from '@/app/lib/models/Project';
import Skill from '@/app/lib/models/Skill';
import SurvivalArea from '@/app/lib/models/SurvivalArea';
import Settings from '@/app/lib/models/Settings';
import Session from '@/app/lib/models/Session';
import GapTracker from '@/app/lib/models/GapTracker';
import Capture from '@/app/lib/models/Capture';

import fs from 'fs/promises';
import path from 'path';

// Types for data files
interface QuestionData {
  id: number;
  question: string;
  theme: string;
  difficulty: number;
}

interface SpineAreaData {
  area: string;
  topicToday: string;
  topicKey: string;
  microtaskToday: string;
  resource: string;
  resourceUrl?: string;
}

interface ProjectData {
  name: string;
  category: string;
  doneMeans: string;
}

interface PayableData {
  name: string;
  book: string;
  chapter: number;
  dailyTask: string;
}

interface DailyPlanEntry {
  day: number;
  phase: string;
  reviewDay: boolean;
  checkpointDay: boolean;
  spineArea: SpineAreaData;
  questionTheme: string;
  questionOffset: number;
  project: ProjectData;
  survival: {
    areaId: number;
    area: string;
    urgency: string;
    topic: string;
    resources: Array<{ name: string; author: string; free: boolean; url: string }>;
  };
  payable: PayableData;
  basicSkill: string;
  basicSkillDrill: string;
  checkpointNote: string | null;
  reviewNote: string | null;
}

interface BasicSkillData {
  id: string;
  name: string;
  category: string;
  dailyDrill: string;
  weeklyGoal: string;
}

interface SkillsData {
  basic: BasicSkillData[];
  payable: Array<{
    id: string;
    name: string;
    category: string;
    book: string;
    totalChapters: number;
  }>;
}

interface SurvivalTopicData {
  id: string;
  title: string;
  drill: string;
  connectedTopicKeys: string[];
}

interface SurvivalAreaData {
  id: number;
  area: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  why: string;
  topics: SurvivalTopicData[];
}

interface TechSpineJsonItem {
  order: number;
  phase: string;
  area: string;
  topic: string;
  dayRange: { start: number; end: number };
  dependencies?: string[];
}

export async function POST() {
  await connectDB();

  try {
    console.log('🧹 WIPING DATABASE...');

    // Wipe all collections dynamically to clear out any old/obsolete tables (no nonsense allowed)
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");
    
    const collections = await db.collections();
    let totalWiped = 0;
    const wipedStats: Record<string, number> = {};
    
    for (const collection of collections) {
      // Don't drop system collections
      if (collection.collectionName.startsWith('system.')) continue;
      
      const result = await collection.deleteMany({});
      totalWiped += result.deletedCount;
      wipedStats[collection.collectionName] = result.deletedCount;
    }

    console.log('✅ Wiped collections:', Object.entries(wipedStats).map(([name, count]) => `${name}(${count})`).join(', '));

    console.log('🌱 SEEDING COLLECTIONS...');

    // =====================
    // 1. SEED QUESTIONS (1,510)
    // =====================
    console.log('📚 Loading questions...');
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    const questionsData: QuestionData[] = JSON.parse(await fs.readFile(questionsPath, 'utf8'));

    const formattedQuestions = questionsData.map((q) => ({
      text: q.question,
      theme: q.theme,
      difficulty: q.difficulty || 1,
      status: 'unseen' as const,
      nextReviewDate: new Date(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    }));

    const questionsResult = await Question.insertMany(formattedQuestions, { ordered: false });
    console.log(`✅ Seeded ${questionsResult.length} questions`);

    // =====================
    // 2. SEED DAILY PLAN (Spine, Projects, Skills from 150 days)
    // =====================
    console.log('📅 Loading daily plan...');
    const planPath = path.join(process.cwd(), 'data', 'daily-plan.json');
    const planData: DailyPlanEntry[] = JSON.parse(await fs.readFile(planPath, 'utf8'));

    const spineDocs: any[] = [];
    const projectDocs: any[] = [];
    const softSkillAssignments: Map<string, any> = new Map();
    const payableSkillDocs: any[] = [];

    for (const day of planData) {
      // Tech Spine entries
      if (day.spineArea) {
        spineDocs.push({
          order: day.day,
          phase: day.phase || 'Foundation',
          week: Math.ceil(day.day / 7),
          area: day.spineArea.area,
          topic: day.spineArea.topicToday,
          microtask: day.spineArea.microtaskToday,
          resource: day.spineArea.resource,
          status: 'pending',
        });
      }

      // Projects
      if (day.project) {
        projectDocs.push({
          order: day.day,
          name: day.project.name,
          description: `${day.project.category}: ${day.project.doneMeans}`,
          status: 'pending',
        });
      }

      // Soft skills - track unique assignments (rotate through 35 skills over 150 days)
      if (day.basicSkill) {
        if (!softSkillAssignments.has(day.basicSkill)) {
          softSkillAssignments.set(day.basicSkill, {
            order: day.day,
            type: 'soft',
            name: day.basicSkill,
            prompt: day.basicSkillDrill,
            status: 'pending',
          });
        }
      }

      // Payable skills - ensure unique by name
      if (day.payable) {
        if (!payableSkillDocs.find(s => s.name === day.payable.name)) {
          payableSkillDocs.push({
            order: day.day,
            type: 'payable',
            name: day.payable.name,
            chapter: day.payable.chapter ? day.payable.chapter.toString() : undefined,
            prompt: day.payable.dailyTask,
            status: 'pending',
          });
        }
      }
    }

    // Load full skills data for soft skills
    const skillsPath = path.join(process.cwd(), 'data', 'skills.json');
    const skillsData: SkillsData = JSON.parse(await fs.readFile(skillsPath, 'utf8'));

    const softSkillDocs = skillsData.basic.map((skill, idx) => ({
      order: idx + 1,
      type: 'soft' as const,
      name: skill.name,
      prompt: skill.dailyDrill,
      status: 'pending',
    }));

    // Insert spine, projects, skills
    const [spineResult, projectResult, softResult, payableResult] = await Promise.all([
      TechSpine.insertMany(spineDocs, { ordered: false }),
      Project.insertMany(projectDocs, { ordered: false }),
      Skill.insertMany(softSkillDocs, { ordered: false }),
      Skill.insertMany(payableSkillDocs, { ordered: false }),
    ]);

    console.log(`✅ Seeded ${spineResult.length} tech spine entries`);
    console.log(`✅ Seeded ${projectResult.length} projects`);
    console.log(`✅ Seeded ${softResult.length} soft skills`);
    console.log(`✅ Seeded ${payableResult.length} payable skills`);

    // =====================
    // 3. SEED SURVIVAL AREAS
    // =====================
    console.log('🎯 Loading survival areas...');
    const survivalPath = path.join(process.cwd(), 'data', 'survival-areas.json');
    const survivalData: SurvivalAreaData[] = JSON.parse(await fs.readFile(survivalPath, 'utf8'));

    const survivalDocs = survivalData.map((area) => ({
      areaId: area.id,
      area: area.area,
      urgency: area.urgency,
      why: area.why,
      topics: area.topics.map((t) => ({
        id: t.id,
        title: t.title,
        drill: t.drill,
        connectedTopicKeys: t.connectedTopicKeys || [],
      })),
    }));

    const survivalResult = await SurvivalArea.insertMany(survivalDocs, { ordered: false });
    console.log(`✅ Seeded ${survivalResult.length} survival areas`);

    // =====================
    // 4. SEED DEFAULT SETTINGS
    // =====================
    console.log('⚙️ Creating default settings...');
    const settingsResult = await Settings.create({
      programStartDate: new Date(),
      programLength: 150,
      currentPhase: 'Foundation',
      questionsPerDay: 9,
      gapThresholds: {
        mediumTrigger: 2,
        criticalTrigger: 3,
        maxCritical: 5,
      },
      aiProviders: {
        teaching: 'groq',
        analysis: 'gemini',
        chat: 'claude',
        deepDive: 'claude',
        fallback: 'openrouter',
      },
      carryForwardEnabled: true,
      sm2Enabled: true,
    });
    console.log('✅ Seeded default settings');

    // =====================
    // SUMMARY
    // =====================
    const summary = {
      wiped: wipedStats,
      seeded: {
        questions: questionsResult.length,
        techSpine: spineResult.length,
        projects: projectResult.length,
        softSkills: softResult.length,
        payableSkills: payableResult.length,
        survivalAreas: survivalResult.length,
        settings: 1,
      },
      total: questionsResult.length + spineResult.length + projectResult.length +
             softResult.length + payableResult.length + survivalResult.length + 1,
    };

    console.log('\n🎉 SEED COMPLETE!');
    console.log('Summary:', JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Database wiped and seeded successfully',
      summary,
    }, { status: 200 });

  } catch (error: any) {
    console.error('💥 Seed Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

// Also support GET for easy checking
export async function GET() {
  await connectDB();

  const collections = ['questions', 'techspines', 'projects', 'skills', 'survivalareas', 'sessions', 'gaptrackers', 'captures', 'settings'];
  const counts: Record<string, number> = {};

  for (const coll of collections) {
    try {
      counts[coll] = await mongoose.connection.collection(coll).countDocuments();
    } catch {
      counts[coll] = 0;
    }
  }

  return NextResponse.json({
    message: 'Database status - use POST to seed/wipe',
    counts,
  });
}
