import fs from 'fs';
import path from 'path';

export function transformSoftSkills() {
  const filePath = path.join(process.cwd(), 'data', 'cognitiveSkills.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.basic.map((item: any, index: number) => {
    return {
      syllabusSlug: 'soft-skills',
      title: item.name,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        microPracticePrompt: item.dailyDrill,
        source: item.category,
        weeklyGoal: item.weeklyGoal
      }
    };
  });
}
