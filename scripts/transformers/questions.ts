import fs from 'fs';
import path from 'path';

export function transformQuestions() {
  const filePath = path.join(process.cwd(), 'data', 'questions.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const questions = JSON.parse(rawData);

  return questions.map((q: any) => {
    return {
      syllabusSlug: 'questions',
      title: q.question,
      difficulty: q.difficulty,
      status: 'not_started',
      sm2: {
        easeFactor: 2.5,
        interval: 1,
        repetition: 0,
        nextReviewDate: new Date(),
        timesStruggled: 0
      },
      meta: {
        theme: q.theme,
        hint: q.hint || undefined,
        answer: q.answer || undefined
      }
    };
  });
}
