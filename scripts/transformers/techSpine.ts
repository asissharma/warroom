import fs from 'fs';
import path from 'path';

export function transformTechSpine() {
  const filePath = path.join(process.cwd(), 'data', 'tech-spine.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.map((item: any, index: number) => {
    return {
      syllabusSlug: 'tech-spine',
      title: item.area,
      phase: item.phase,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        domain: item.phase || 'General',
        dependencies: [],
        resources: item.resource ? [{ name: item.resource, url: item.resourceUrl }] : [],
        microtasks: item.microtasks || [],
        topics: item.topics || [],
        topicKeys: item.topicKeys || []
      }
    };
  });
}
