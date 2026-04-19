import { ISyllabusItem } from '../models/SyllabusItem';
import { ISettings } from '../models/Settings';

export interface PriorityBuckets {
  carryForward: ISyllabusItem[];
  overdueItems: ISyllabusItem[];
  criticalGaps: ISyllabusItem[];
  mediumGaps: ISyllabusItem[];
  inProgress: ISyllabusItem[];
  newItems: ISyllabusItem[];
}

export function buildQueue(buckets: PriorityBuckets, settings: ISettings, plannedMinutes: number): string[] {
  const queueIds: string[] = [];
  
  // Apply session budget map
  let budget = 0;
  if (plannedMinutes <= 15) budget = 5;
  else if (plannedMinutes <= 30) budget = 10;
  else if (plannedMinutes <= 60) budget = 18;
  else budget = 28;

  const typeCounts: Record<string, number> = {};

  const addItems = (items: ISyllabusItem[]) => {
    for (const item of items) {
      if (queueIds.length >= budget) return;

      const slug = item.syllabusSlug;
      const idStr = item._id!.toString();
      
      const config = settings.syllabusConfig.find((c: any) => c.slug === slug);
      // Give a sensible default max (e.g. 5) if no config, though settings should always have it
      const maxAllowed = config ? config.maxPerSession : 5;
      const currentCount = typeCounts[slug] || 0;

      if (currentCount >= maxAllowed) continue;
      
      if (!queueIds.includes(idStr)) {
        queueIds.push(idStr);
        typeCounts[slug] = currentCount + 1;
      }
    }
  };

  addItems(buckets.carryForward);
  addItems(buckets.overdueItems);
  addItems(buckets.criticalGaps);
  addItems(buckets.mediumGaps);
  addItems(buckets.inProgress);
  addItems(buckets.newItems);

  return queueIds;
}
