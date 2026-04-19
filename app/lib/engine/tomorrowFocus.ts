import { ISession } from '../models/Session';
import { ISyllabusItem } from '../models/SyllabusItem';

export interface TomorrowFocus {
  topGap: string | null;
  nextTopic: string | null;
  overdueCount: number;
}

export function calcTomorrowFocus(sessions: ISession[], allItems: ISyllabusItem[]): TomorrowFocus {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Optional: Set to end of day tomorrow or start depending on definitions. 
  // We'll keep it as exactly 24 hours from now to follow naive "<= tomorrow".
  
  let overdueCount = 0;
  let topGap: string | null = null;
  let nextTopic: string | null = null;

  for (const item of allItems) {
    if (item.sm2 && item.sm2.nextReviewDate && new Date(item.sm2.nextReviewDate) <= tomorrow) {
      overdueCount++;
    }
  }

  // Find top gap (critical > medium > low)
  const gaps = allItems.filter(i => i.gap != null);
  const critical = gaps.find(i => i.gap?.severity === 'critical');
  const medium = gaps.find(i => i.gap?.severity === 'medium');
  const low = gaps.find(i => i.gap?.severity === 'low');

  if (critical) topGap = critical.title;
  else if (medium) topGap = medium.title;
  else if (low) topGap = low.title;

  // Find next tech spine
  const techSpineQueue = allItems
    .filter(i => i.syllabusSlug === 'tech-spine' && (i.status === 'not_started' || i.status === 'in_progress'))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (techSpineQueue.length > 0) {
    nextTopic = techSpineQueue[0].title;
  }

  return {
    topGap,
    nextTopic,
    overdueCount
  };
}
