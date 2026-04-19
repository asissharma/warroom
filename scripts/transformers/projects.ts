import fs from 'fs';
import path from 'path';

export function transformProjects() {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const projects = JSON.parse(rawData);

  return projects.map((p: any, index: number) => {
    return {
      syllabusSlug: 'projects',
      title: p.name,
      phase: p.phase,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        category: p.category,
        criteria: p.doneMeans ? [p.doneMeans] : [],
        buildNotes: [],
        carryForwardCount: 0
      }
    };
  });
}
