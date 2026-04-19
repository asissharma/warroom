import fs from 'fs';
import path from 'path';

export function transformPayableSkills() {
  const filePath = path.join(process.cwd(), 'data', 'payableSkills.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.payable.map((item: any, index: number) => {
    return {
      syllabusSlug: 'payable-skills',
      title: item.name,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        chapterMap: item.chapterMap || {},
        completionPercent: 0,
        source: item.coreBooks || [],
        microPractice: item.microPractice,
        weeklyGoal: item.weeklyGoal
      }
    };
  });
}
