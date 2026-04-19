import fs from 'fs';
import path from 'path';

export function transformCourses() {
  const filePath = path.join(process.cwd(), 'data', 'courses.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.map((item: any, index: number) => {
    return {
      syllabusSlug: 'courses',
      title: item.name,
      orderIndex: index,
      status: 'not_started',
      sm2: null,
      meta: {
        provider: item.provider,
        url: item.url,
        area: item.area,
        weekRecommended: item.weekRecommended || null,
        modules: [],
        recommendedPace: 'self-paced',
        certification: !!item.name?.toLowerCase().includes('certificat')
      }
    };
  });
}
