import fs from 'fs';
import path from 'path';

export function transformSurvivalGaps() {
  const filePath = path.join(process.cwd(), 'data', 'survival-areas.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.map((item: any, index: number) => {
    return {
      syllabusSlug: 'survival-gaps',
      title: item.area,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        priority: item.urgency || 'MEDIUM',
        mitigation: item.why || '',
        topics: item.topics || [],
        resources: item.resources || [],
        rotationDays: item.rotationDays || [],
        spineTopicKeys: item.spineTopicKeys || []
      }
    };
  });
}
