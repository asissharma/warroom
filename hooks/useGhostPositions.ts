import { useMemo } from 'react';
import projectsJson from '@/data/projects.json';
import questionsJson from '@/data/questions.json';
import techSpineJson from '@/data/tech-spine.json';
import skillsJson from '@/data/skills.json';
import survivalJson from '@/data/survival-areas.json';
import { jsonItemToPosition } from '@/lib/nodePositions';

export function useGhostPositions() {
  return useMemo(() => {
    return [
      ...projectsJson.map(p => jsonItemToPosition(p, 'projects')),
      ...questionsJson.map(q => jsonItemToPosition(q, 'questions')),
      ...techSpineJson.map(t => jsonItemToPosition(t, 'tech-spine')),
      ...(skillsJson.basic || []).map(s => jsonItemToPosition(s, 'skills')),
      ...(skillsJson.payable || []).map(s => jsonItemToPosition(s, 'skills')),
      ...survivalJson.map(sv => jsonItemToPosition(sv, 'survival')),
    ];
  }, []);
}
