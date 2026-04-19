

import mongoose from 'mongoose';
import { connectDB } from '../app/lib/db';
import { SyllabusModel } from '../app/lib/models/Syllabus';
import { SyllabusItemModel } from '../app/lib/models/SyllabusItem';
import { SessionModel } from '../app/lib/models/Session';
import { SYLLABUSES } from './syllabuses';

import { transformQuestions } from './transformers/questions';
import { transformTechSpine } from './transformers/techSpine';
import { transformProjects } from './transformers/projects';
import { transformSoftSkills } from './transformers/softSkills';
import { transformPayableSkills } from './transformers/payableSkills';
import { transformSurvivalGaps } from './transformers/survivalGaps';
import { transformCourses } from './transformers/courses';

async function seed() {
  await connectDB();
  console.log('Connected to DB. Wiping old data...');
  
  await SyllabusModel.deleteMany({});
  await SyllabusItemModel.deleteMany({});
  await SessionModel.deleteMany({});
  
  console.log('Seeding syllabuses...');
  await SyllabusModel.insertMany(SYLLABUSES);
  console.log(`Inserted ${SYLLABUSES.length} syllabuses.`);

  console.log('Running transformers...');
  const questions = transformQuestions();
  const techSpine = transformTechSpine();
  const projects = transformProjects();
  const softSkills = transformSoftSkills();
  const payableSkills = transformPayableSkills();
  const survivalGaps = transformSurvivalGaps();
  const courses = transformCourses();

  const allItems = [
    ...questions,
    ...techSpine,
    ...projects,
    ...softSkills,
    ...payableSkills,
    ...survivalGaps,
    ...courses
  ];

  console.log(`Prepared ${allItems.length} total items. Inserting...`);
  await SyllabusItemModel.insertMany(allItems);
  console.log('Seeding complete!');
  
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
